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

export type TradeResult =
    | { success: true; shares: string; totalValue: string; message: string }
    | {
          success: false;
          reason:
              | "INSUFFICIENT_FUNDS"
              | "AMOUNT_TOO_SMALL"
              | "INSUFFICIENT_SHARES";
          message: string;
      };

// Shared body of every sell. Deliberately NOT exported: every export in a "use server"
// file becomes a public endpoint, and this one takes a raw userId with no session check.
// Takes an already-open `tx` so the caller can span a read and this write in one
// transaction, and an already-exact Decimal so no precision is lost at the boundary.
async function executeSell(
    tx: Prisma.TransactionClient,
    userId: number,
    assetId: number,
    sharesToSell: Prisma.Decimal,
    price: Prisma.Decimal,
): Promise<Prisma.Decimal> {
    // Proceeds are derived from shares * price and carry more than 2 decimals. Round
    // explicitly and ROUND_DOWN: letting Postgres round on insert would round half-up
    // and credit more than the shares were worth, in the same direction every sale.
    const amount = sharesToSell.mul(price).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);

    // The gte guard lives in the WHERE, not in app code: the check and the update
    // become one statement, so a concurrent sell can't drive the position negative.
    const result = await tx.holding.updateMany({
        where: {
            userId,
            assetId,
            shares: { gte: sharesToSell },
        },
        data: {
            shares: { decrement: sharesToSell },
        },
    });
    if (result.count === 0) {
        throw new InsufficientSharesError("Insufficient shares to sell");
    }

    // A zeroed position is deleted rather than kept at 0 so "things you own" stays true
    await tx.holding.deleteMany({
        where: {
            userId,
            assetId,
            shares: { lte: 0 },
        },
    });

    await tx.user.update({
        where: { id: userId },
        data: {
            mockBalance: { increment: amount },
        },
    });

    await tx.trade.create({
        data: {
            userId,
            assetId,
            type: "SELL",
            shares: sharesToSell,
            pricePerShare: price,
            totalValue: amount,
        },
    });

    return amount;
}

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
        revalidatePath("/dashboard", "layout");
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

    if (sharesToSell.lte(0)) {
        return {
            success: false,
            reason: "AMOUNT_TOO_SMALL",
            message: "That amount is too small to sell.",
        };
    }

    try {
        const amount = await db.$transaction((tx) =>
            executeSell(tx, user.id, validatedAssetId, sharesToSell, price),
        );
        revalidatePath("/dashboard", "layout");
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

export async function sellAssetPercent(
    assetId: number,
    percent: number,
): Promise<TradeResult> {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const assetIdSchema = z.number().int().positive();
    const validatedAssetId = assetIdSchema.parse(assetId);
    const percentSchema = z.union([z.literal(50), z.literal(100)]); // Only allow 50% or 100% for now
    const validatedPercent = percentSchema.parse(percent);

    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
    });
    if (!user) {
        throw new Error("User not found");
    }

    const asset = await db.asset.findUnique({
        where: { id: validatedAssetId },
        select: { currentPrice: true },
    });
    if (!asset) {
        throw new Error("Asset not found");
    }
    const price = asset.currentPrice;

    try {
        // The Holding is read INSIDE the transaction. Reading it outside would reopen a
        // TOCTOU gap: a concurrent buy between read and write would make "sell all"
        // leave shares behind, and "sell 50%" sell the wrong fraction.
        const executed = await db.$transaction(async (tx) => {
            const holding = await tx.holding.findUnique({
                where: {
                    userId_assetId: { userId: user.id, assetId: validatedAssetId },
                },
                select: { shares: true },
            });
            if (!holding) {
                throw new InsufficientSharesError("No position in this asset");
            }

            // 100% passes the stored Decimal through untouched so shares - shares is
            // exactly 0 and the deleteMany fires. Any arithmetic here could leave a
            // dust position the user can never clear, since each "sell all" would
            // round down to a smaller remainder instead of reaching zero.
            const sharesToSell =
                validatedPercent === 100
                    ? holding.shares
                    : holding.shares
                          .mul(validatedPercent)
                          .div(100)
                          .toDecimalPlaces(8, Prisma.Decimal.ROUND_DOWN);

            if (sharesToSell.lte(0)) {
                throw new InsufficientSharesError("Position too small to sell a fraction");
            }

            const amount = await executeSell(
                tx,
                user.id,
                validatedAssetId,
                sharesToSell,
                price,
            );
            return { shares: sharesToSell, amount };
        });

        revalidatePath("/dashboard", "layout");
        return {
            success: true,
            shares: executed.shares.toString(),
            totalValue: executed.amount.toFixed(2),
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
        console.error("sellAssetPercent failed", error);
        throw error;
    }
}