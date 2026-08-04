import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import AssetCard from "@/components/dashboard/AssetCard";

export default async function Portfolio() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }
    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, mockBalance: true },
    });
    if (!user) {
        throw new Error("User not found");
    }
    // Decimal is a class instance and can't cross the Server -> Client boundary.
    // String, not number: a float would reintroduce the drift trading.ts avoids.
    const balanceInDollars = user.mockBalance.toString();

    const assets = await db.asset.findMany({
        select: {
            id: true,
            name: true,
            ticker: true,
            currentPrice: true
        }
    });
    const formattedAssets = assets.map((asset) => ({
        ...asset,
        currentPrice: asset.currentPrice.toString(),
    }));

    // Scoped to the session user. Without this filter findMany returns every user's
    // positions — a data leak, and the sell buttons would target rows we don't own.
    const holdings = await db.holding.findMany({
        where: {
            userId: user.id,
        },
        select: {
            assetId: true,
            shares: true,
            asset: { select: { ticker: true, name: true } },
        },
    });
    const formattedHoldings = holdings.map((holding) => ({
        ...holding,
        shares: holding.shares.toString(),
    }));

    return (
        <main className="p-6">
            <h1 className="text-3xl mb-1 text-ink">Portfolio</h1>
            <p className="text-ink-soft">Cash available: ${balanceInDollars}</p>
            <h2 className="text-xl font-bold mt-6 text-ink">Assets You Can Buy</h2>
            <div className="mt-4">
                {formattedAssets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No Valid Assets Available</p>
                ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formattedAssets.map((asset) => (
                            <li key={asset.id}>
                                <AssetCard asset={asset} userBalance={balanceInDollars} holding={formattedHoldings.find(h => h.assetId === asset.id) || null} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <h2 className="text-xl font-bold mt-6">Your Holdings</h2>
            <div className="mt-4">
                {formattedHoldings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">You don&apos;t have any holdings.</p>
                ) : (
                    <div className="border border-border bg-surface rounded-2xl p-4">
                        {formattedHoldings.map((holding) => (
                            <div key={holding.assetId} className="mb-4">
                                <p className="text-ink font-semibold">
                                    {holding.asset.ticker} &mdash; {holding.asset.name}
                                </p>
                                <p className="text-sm text-ink-soft">{holding.shares} shares</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}