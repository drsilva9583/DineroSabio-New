"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { Prisma } from "../../../src/generated/prisma";
import { revalidatePath } from "next/cache";

// Thrown inside the transaction purely to trigger rollback; the catch translates it
// into a return value. A distinct class beats matching on error.message.
class InsufficientBalanceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InsufficientBalanceError";
    }
}

class InsufficientSharesError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InsufficientSharesError";
    }
}

type TradeResult =
    | { success: true; shares: string; totalValue: string; message: string }
    | {
          success: false;
          reason:
              | "INSUFFICIENT_FUNDS"
              | "AMOUNT_TOO_SMALL"
              | "INSUFFICIENT_SHARES";
          message: string;
      };

export async function buyAsset(
    assetId: number,
    amountInDollars: number,
): Promise<TradeResult> {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }
    
    //cap decimals at 2 for amountInDollars
    const amountInDollarsSchema = z.number().positive().refine((val) => {
        return Math.round(val * 100) / 100 === val;
    }, "Amount must have at most 2 decimal places");
    const validatedAmountInDollars = amountInDollarsSchema.parse(amountInDollars);

    const assetIdSchema = z.number().int().positive();
    const validatedAssetId = assetIdSchema.parse(assetId);

    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
    });
    if (!user) {
        throw new Error("User not found");
    }
    // find the asset in the database and get its current price
    const asset = await db.asset.findUnique({
        where: { id: validatedAssetId },
        select: { currentPrice: true },
    });
    if (!asset) {
        throw new Error("Asset not found");
    }

    // Decimal, not float: binary floating point can't represent money exactly and the
    // rounding drift would stop the trade ledger from reconciling against mockBalance.
    const price = asset.currentPrice;
    const amount = new Prisma.Decimal(validatedAmountInDollars);

    // ROUND_DOWN so we never credit a sliver of a share the user didn't pay for
    const sharesToBuy = amount.div(price).toDecimalPlaces(8, Prisma.Decimal.ROUND_DOWN);

    if (sharesToBuy.lte(0)) {
        return {
            success: false,
            reason: "AMOUNT_TOO_SMALL",
            message: "That amount is too small to buy any shares of this asset.",
        };
    }

    try {
        await db.$transaction(async (tx) => {
            // The gte guard lives in the WHERE, not in app code: the check and the
            // write become one statement, so a concurrent buy can't overdraw the wallet.
            const result = await tx.user.updateMany({
                where: {
                    id: user.id, mockBalance: { gte: amount }
                },
                data: {
                    mockBalance: { decrement: amount }
                }
            });
            if (result.count === 0) {
                throw new InsufficientBalanceError("Insufficient balance");
            }
            await tx.holding.upsert({
                where: {
                    userId_assetId: { userId: user.id, assetId: validatedAssetId }
                },
                create: {
                    userId: user.id,
                    assetId: validatedAssetId,
                    shares: sharesToBuy
                },
                update: {
                    shares: { increment: sharesToBuy }
                }
            });
            await tx.trade.create({
                data: {
                    userId: user.id,
                    assetId: validatedAssetId,
                    type: "BUY",
                    shares: sharesToBuy,
                    pricePerShare: price,
                    // the exact dollars debited, not shares * price — share rounding
                    // would otherwise leave the ledger unreconcilable with mockBalance
                    totalValue: amount
                }
            });
        });
        revalidatePath("/dashboard");
        return {
            success: true,
            shares: sharesToBuy.toString(),
            totalValue: amount.toFixed(2),
            message: "Asset purchased successfully",
        };
    } catch (error) {
        if (error instanceof InsufficientBalanceError) {
            return {
                success: false,
                reason: "INSUFFICIENT_FUNDS",
                message: "You don't have enough balance for this purchase.",
            };
        }
        console.error("buyAsset failed", error);
        throw error;
    }
}


export async function sellAsset(
    assetId: number,
    shares: number,
): Promise<TradeResult> {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const assetIdSchema = z.number().int().positive();
    const validatedAssetId = assetIdSchema.parse(assetId);
    const sharesSchema = z.number().positive();
    const validatedShares = sharesSchema.parse(shares);

    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
    });
    if (!user) {
        throw new Error("User not found");
    }

    // find the asset in the database and get its current price
    const asset = await db.asset.findUnique({
        where: { id: validatedAssetId },
        select: { currentPrice: true },
    });
    if (!asset) {
        throw new Error("Asset not found");
    }
    const price = asset.currentPrice;
    // truncate to the 8 decimals the column stores, so the quantity we guard on is
    // exactly the quantity we decrement
    const sharesToSell = new Prisma.Decimal(validatedShares).toDecimalPlaces(
        8,
        Prisma.Decimal.ROUND_DOWN,
    );

    // Unlike buy (where the user names the dollar amount), proceeds are derived from
    // shares * price and carry more than 2 decimals. Round explicitly and ROUND_DOWN:
    // letting Postgres round on insert would round half-up and credit the user more
    // than the shares were worth, in the same direction on every sale.
    const amount = sharesToSell.mul(price).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);

    try {
        await db.$transaction(async (tx) => {
            // The gte guard lives in the WHERE, not in app code: the check and the
            // update are atomic
            const result = await tx.holding.updateMany({
                where: {
                    userId: user.id,
                    assetId: validatedAssetId,
                    shares: { gte: sharesToSell }
                },
                data: {
                    shares: { decrement: sharesToSell }
                }
            });
            if (result.count === 0) {
                throw new InsufficientSharesError("Insufficient shares to sell");
            }
            await tx.holding.deleteMany({
                where: {
                    userId: user.id,
                    assetId: validatedAssetId,
                    shares: { lte: 0 }
                }
            });
            await tx.user.update({
                where: { id: user.id },
                data: {
                    mockBalance: { increment: amount }
                }
            });
            await tx.trade.create({
                data: {
                    userId: user.id,
                    assetId: validatedAssetId,
                    type: "SELL",
                    shares: sharesToSell,
                    pricePerShare: price,
                    totalValue: amount
                }
            });
        });
        revalidatePath("/dashboard");
        return {
            success: true,
            shares: sharesToSell.toString(),
            totalValue: amount.toFixed(2),
            message: "Asset sold successfully",
        };
    } catch (error) {
        if (error instanceof InsufficientSharesError) {
            return {
                success: false,
                reason: "INSUFFICIENT_SHARES",
                message: "You don't own enough shares to sell that amount.",
            };
        }
        console.error("sellAsset failed", error);
        throw error;
    }
}