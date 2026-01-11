import Link from "next/link";
import { db } from "@/lib/db";
import { ImageIcon } from "lucide-react";
import { SignOutButton } from '@clerk/nextjs';
import { currentUser } from "@clerk/nextjs/server";

export default async function Page() {
    const user = await currentUser();
    const courses = await db.course.findMany({
        include: {
            lessons: {
                include: {
                    progress: true,
                }
            }
        }
    })

  return (
    <>
        <header className="p-6 border-b mb-8 flex items-center">
            <ImageIcon className="mr-4" />
            <div>
                <h1 className="text-4xl font-bold">Dinero Sabio</h1>
                <h3>Learn, Practice, Succeed</h3>
            </div>
            <div>
                <nav className="flex gap-8 ml-10">
                    <a href="/dashboard" className="text-lg hover:underline">Home</a>
                    <a href="#" className="text-lg hover:underline">Portfolio</a>
                </nav>
            </div>
            <div className="absolute right-32">
                Welcome {user?.firstName ? `${user.firstName}` : "Guest"}
            </div>
            <div className="ml-auto bg-green-700 hover:bg-green-800 rounded-full px-4 py-2">
                <SignOutButton />
            </div>
        </header>
        <main>
            <div className="flex items-center justify-center flex-direction flex-col">
                <h1 className="text-3xl font-bold mb-1">Your Learning Dashboard</h1>
                <p className="text-gray-600">Choose a course to begin</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {courses.map((course) => (
                    <Link 
                        key={course.id} 
                        href={`/courses/${course.id}`}
                        className="border rounded-lg hover:shadow-md hover:scale-102 transition-transform duration-300 flex"
                    >
                        <ImageIcon className="m-4 size-10 shrink-0" />
                        <div key={course.id} className="p-4 flex flex-col flex-1">
                            <h2 className="text-lg font-semibold">{course.courseTitle}</h2>
                            <p className="text-sm text-gray-600">{course.courseDescription}</p>
                            <div className="flex gap-4 p-4 text-xs mt-auto">
                                <p className="rounded-md text-gray-500 bg-gray-100 text-center p-1">{course.lessons.length} lessons</p>
                                <p className="rounded-md text-gray-500 bg-gray-100 text-center p-1">{course.estimatedTime} minutes</p>
                                <p className="rounded-md text-gray-500 bg-gray-100 text-center p-1">{course.difficultyLevel}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    </>
  );
}