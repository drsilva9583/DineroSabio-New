import { ReactNode } from "react"
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/Header";
import AiMentor from "@/components/dashboard/AiMentor";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    } 

    return (
        <div className="min-h-screen">
            <DashboardHeader />
            {children}
            <AiMentor />
        </div>
    );
}