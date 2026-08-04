import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export default async function DashboardHeader() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }
    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { mockBalance: true },
    });
    if (!user) {
        throw new Error("User not found");
    }
    const dollarBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(user.mockBalance));

    return (
    <header className="p-4 px-6 border-b border-border mb-8 flex items-center bg-surface">
            <div>
                <h1 className="text-4xl text-ink">Dinero Sabio</h1>
                <h3 className="text-ink-soft">Learn, Practice, Succeed</h3>
            </div>
            <div className="hidden sm:flex">
                <nav className="flex gap-8 ml-10">
                    <Link href="/dashboard" className="text-lg text-ink-soft hover:text-ink hover:underline">Courses</Link>
                    <Link href="/dashboard/portfolio" className="text-lg text-ink-soft hover:text-ink hover:underline">Portfolio</Link>
                </nav>
            </div>
            <div className="sm:hidden flex ml-5 mx-auto">
                <Menu className="w-6 h-6 text-ink-soft" />
            </div>
            <div className="hidden sm:flex items-center">
                <button className="ml-10 text-lg text-ink-soft hover:bg-surface-sunken border border-border rounded-full px-2 py-1">en English</button>
                <div className="ml-4"><ThemeToggle /></div>
            </div>
            <div className="sm:hidden flex mx-auto items-center gap-2">
                <button className="text-lg text-ink-soft hover:bg-surface-sunken border border-border rounded-full px-2 py-1">en</button>
                <ThemeToggle />
            </div>
            <div className="ml-auto text-ink-soft">
                <p className="text-lg">Balance: {dollarBalance}</p>
            </div>
            <div className="ml-auto bg-green hover:bg-green-strong text-surface rounded-full px-4 py-2 font-semibold transition-colors">
                <SignOutButton />
            </div>
        </header>
    );
}