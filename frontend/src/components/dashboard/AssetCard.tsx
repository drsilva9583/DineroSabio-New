"use client";

import { useState, useTransition, useEffect } from "react";
import { buyAsset, sellAsset, sellAssetPercent } from "@/app/actions/trading";

interface AssetCardProps {
    asset: { id: number; name: string; ticker: string; currentPrice: string };
    userBalance: string;
    holding: { shares: string } | null;
}

// The Server Actions parse with Zod and THROW on a bad shape rather than returning a
// TradeResult, so anything Zod would reject has to be caught here first.
function decimalPlaces(value: string) {
    return value.split(".")[1]?.length ?? 0;
}

export default function AssetCard({ asset, userBalance, holding }: AssetCardProps) {
    const [buyAmount, setBuyAmount] = useState("");
    const [sellShares, setSellShares] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!result) return;
        const timer = setTimeout(() => setResult(null), 4000);
        return () => clearTimeout(timer);
    }, [result]);

    const handleBuy = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(buyAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            setResult("Enter an amount greater than $0.");
            return;
        }
        if (decimalPlaces(buyAmount) > 2) {
            setResult("Amount can have at most 2 decimal places.");
            return;
        }
        startTransition(async () => {
            const res = await buyAsset(asset.id, amount);
            setResult(res.message);
            if (res.success) setBuyAmount("");
        });
    };

    const handleSell = (e: React.FormEvent) => {
        e.preventDefault();
        const shares = Number(sellShares);
        if (!Number.isFinite(shares) || shares <= 0) {
            setResult("Enter a number of shares greater than 0.");
            return;
        }
        // Holding.shares is Decimal(18,8); more precision than that is silently truncated
        if (decimalPlaces(sellShares) > 8) {
            setResult("Shares can have at most 8 decimal places.");
            return;
        }
        startTransition(async () => {
            const res = await sellAsset(asset.id, shares);
            setResult(res.message);
            if (res.success) setSellShares("");
        });
    };

    // Only the percentage is sent. The share count is resolved from the Holding row
    // inside the transaction — computing it here would send a stale float and could
    // leave a dust position the user can never clear.
    const handleSellPercent = (percent: 50 | 100) => {
        startTransition(async () => {
            const res = await sellAssetPercent(asset.id, percent);
            setResult(res.message);
        });
    };

    // Client-side affordability check is UX only. The authoritative guard is the
    // `mockBalance >= amount` predicate in the action's WHERE clause.
    const canAfford = Number(buyAmount) <= Number(userBalance);
    const ownedShares = Number(holding?.shares ?? 0);

    return (
        <div className="border border-border bg-surface rounded-2xl p-4">
            <h2 className="text-xl font-bold text-ink">{asset.name}</h2>
            <p className="text-sm text-ink-soft">{asset.ticker}</p>
            <p className="text-lg font-semibold text-ink">${asset.currentPrice}</p>

            <form className="mt-2" onSubmit={handleBuy}>
                <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="Amount to buy"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="border border-border rounded px-2 py-1 w-full"
                />
                <button
                    type="submit"
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isPending || buyAmount === "" || !canAfford}
                >
                    Buy
                </button>
            </form>

            {holding && (
                <div className="mt-2">
                    <p className="text-sm text-ink-soft">You own {holding.shares} shares</p>
                    <form className="mt-2" onSubmit={handleSell}>
                        <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min="0"
                            placeholder="Shares to sell"
                            value={sellShares}
                            onChange={(e) => setSellShares(e.target.value)}
                            className="border border-border rounded px-2 py-1 w-full"
                        />
                        <button
                            type="submit"
                            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={
                                isPending || sellShares === "" || Number(sellShares) > ownedShares
                            }
                        >
                            Sell
                        </button>
                    </form>
                    <button
                        type="button"
                        className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleSellPercent(50)}
                        disabled={isPending}
                    >
                        Sell 50%
                    </button>
                    <button
                        type="button"
                        className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleSellPercent(100)}
                        disabled={isPending}
                    >
                        Sell All
                    </button>
                </div>
            )}

            {result && <p className="mt-2 text-sm text-ink-soft">{result}</p>}
        </div>
    );
}
