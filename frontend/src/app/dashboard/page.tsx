import Link from "next/link";
import { db } from "@/lib/db";
import { ImageIcon } from "lucide-react";
import { PiggyBank } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import { currentUser } from "@clerk/nextjs/server";
import { getLessonCountColor, getTimeColor, getDifficultyColor } from "@/lib/courseHelpers";

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
                <h1 className="text-3xl font-bold mb-1">{user?.firstName}&#39;s Learning Dashboard</h1>
                <p className="text-gray-600">Choose a course to begin</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {courses.map((course) => (
                    <Link 
                        key={course.id} 
                        href={`/dashboard/courses/${course.id}`}
                        className="border rounded-3xl hover:shadow-md hover:scale-102 transition-transform duration-300 flex flex-col"
                    >
                        <div className="flex">
                            <PiggyBank className="m-4 size-15 shrink-0" />
                            <div key={course.id} className="p-4 flex flex-col flex-1">
                                <h2 className="text-2xl font-semibold">{course.courseTitle}</h2>
                                <p className="text-sm text-gray-600">{course.courseDescription}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 m-4 pt-8 text-xs mt-auto justify-evenly">
                                <p className={`rounded-lg text-gray-950 ${getLessonCountColor(course.lessons.length)} text-center p-1 px-4`}>{course.lessons.length} lessons</p>
                                <p className={`rounded-lg text-gray-950 ${getTimeColor(course.estimatedTime)} text-center p-1 px-4`}>{course.estimatedTime} minutes</p>
                                <p className={`rounded-lg text-gray-950 ${getDifficultyColor(course.difficultyLevel)} text-center p-1 px-4`}>{course.difficultyLevel}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    </>
  );
}