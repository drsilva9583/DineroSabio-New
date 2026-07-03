import Link from "next/link";
import { SignOutButton} from "@clerk/nextjs";
import { Menu } from "lucide-react";

export default async function DashboardHeader() {

    return (
    <header className="p-4 px-6 border-b mb-8 flex items-center bg-dashboard-bg/35">
            <div>
                <h1 className="text-4xl font-bold">Dinero Sabio</h1>
                <h3>Learn, Practice, Succeed</h3>
            </div>
            <div className="hidden sm:flex">
                <nav className="flex gap-8 ml-10">
                    <Link href="/dashboard" className="text-lg text-gray-600 hover:underline">Courses</Link>
                    <Link href="#" className="text-lg text-gray-600 hover:underline">Portfolio</Link>
                </nav>
            </div>
            <div className="sm:hidden flex ml-5 mx-auto">
                <Menu className="w-6 h-6 text-gray-600" />
            </div>
            <div className="hidden sm:flex">
                <button className="ml-10 text-lg text-gray-600 hover:bg-dashboard-bg-dark/35 border border-gray-600 rounded-full px-2 py-1">en English</button>
            </div>
            <div className="sm:hidden flex mx-auto">
                <button className="ml-10 text-lg text-gray-600 hover:bg-dashboard-bg-dark/35 border border-gray-600 rounded-full px-2 py-1">en</button>
            </div>
            <div className="ml-auto bg-theme-green hover:bg-theme-green-dark rounded-full px-4 py-2 font-semibold">
                <SignOutButton />
            </div>
        </header>
    );
}