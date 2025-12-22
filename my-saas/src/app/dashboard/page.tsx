import { Input } from "@/components/ui/input"
import { ImageIcon } from "lucide-react";

export default function Page() {
  return (
    <>
        <header className="p-6 border-b mb-8 flex items-center">
            <ImageIcon className="mr-4" />
            <div>
                <h1 className="text-4xl font-bold">Dinero Sabio</h1>
            </div>
            <div className="">
                <nav className="flex gap-8 ml-10">
                    <a href="#" className="text-lg hover:underline">Home</a>
                    <a href="#" className="text-lg hover:underline">Lessons</a>
                    <a href="#" className="text-lg hover:underline">Portfolio</a>
                    <a href="#" className="text-lg hover:underline">Other</a>
                </nav>
            </div>
            <div className="ml-auto">
                <button className="bg-green-700 hover:bg-green-800 rounded-full px-4 py-2">
                    <ImageIcon />
                </button>

            </div>
        </header>
        <main>
            <div className="flex justify-center">
                <Input placeholder="Search lessons..." className="w-1/2 justify-center h-10" />
            </div>
            <div>
                {/* Dashboard content goes here */}
            </div>
        </main>
    </>
  );
}