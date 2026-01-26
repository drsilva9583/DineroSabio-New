import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props {
    params: {
        courseId: string;
    }
}

export default async function CourseDetailPage({ params }: Props) {
    const courseId = Number(params.courseId);
    if (Number.isNaN(courseId)) {
        return notFound();
    }
    const course = await db.course.findMany(
        {
            where: { id: courseId },
            include: {
                lessons: {orderBy: { id: 'asc' }}
            }
        }
    );

    return (
        <>
            <main className="p-6">
                <h1 className="text-3xl font-bold mb-4">{course[0]?.courseTitle}</h1>
            </main>
        </>
    )
}