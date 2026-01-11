import Link from "next/link";
import { SignOutButton} from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ImageIcon } from "lucide-react";

export default async function DashboardHeader() {
    const user = await currentUser();

    return (
    <header className="p-6 border-b mb-8 flex items-center">
            <ImageIcon className="mr-4" />
            <div>
                <h1 className="text-4xl font-bold">Dinero Sabio</h1>
                <h3>Learn, Practice, Succeed</h3>
            </div>
            <div>
                <nav className="flex gap-8 ml-10">
                    <Link href="/dashboard" className="text-lg hover:underline">Home</Link>
                    <Link href="#" className="text-lg hover:underline">Portfolio</Link>
                </nav>
            </div>
            <div className="absolute right-32">
                Welcome {user?.firstName ? `${user.firstName}` : "Guest"}
            </div>
            <div className="ml-auto bg-green-700 hover:bg-green-800 rounded-full px-4 py-2">
                <SignOutButton />
            </div>
        </header>
    );
}