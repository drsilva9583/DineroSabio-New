import Link from "next/link";
import { db } from "@/lib/db";
import { ImageIcon } from "lucide-react";
import { SignOutButton } from '@clerk/nextjs';
import { currentUser } from "@clerk/nextjs/server";

export default async function Page() {
    const user = await currentUser();
    const courses = await db.course.findMany({
        include: {
            lessons: true
        }
    })

  return (
    <>
        <main>
            <div className="flex items-center justify-center flex-direction flex-col">
                <h1 className="text-3xl font-bold mb-1">Your Learning Dashboard</h1>
                <p className="text-gray-600">Choose a course to begin</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {courses.map((course) => (
                    <Link 
                        key={course.id} 
                        href={`/dashboard/courses/${course.id}`}
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