import Link from "next/link";
import { db } from "@/lib/db";

interface Props {
    params: {
        courseId: number;
    }
}

export default async function CourseDetailPage({ params }: Props) {
    const courseId = params.courseId;
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
        </>
    )
}