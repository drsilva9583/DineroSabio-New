import { ReactNode } from "react"
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    } 

    return (
        <div className="min-h-screen">
            <main>
                {children}
            </main>
        </div>
    );
}