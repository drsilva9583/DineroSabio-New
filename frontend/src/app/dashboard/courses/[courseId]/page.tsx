import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
    const { courseId: courseIdStr } = await params;
    const courseId = Number(courseIdStr);

    if (Number.isNaN(courseId)) {
        return notFound();
    }

    const course = await db.course.findUnique({
        where: { id: courseId },
        include: {
            lessons: { orderBy: { id: "asc" } },
        },
    });

    if (!course) {
        return notFound();
    }

    return (
        <main className="p-6">
            <h1 className="text-3xl font-bold mb-4">{course.courseTitle}</h1>
            <ul className="flex flex-col gap-4 mt-6">
                {course.lessons.map((lesson) => (
                    <li
                        key={lesson.id}
                        className="border rounded-2xl p-4 hover:shadow-md transition-shadow"
                    >
                        <h2 className="text-xl font-semibold">{lesson.lessonTitle}</h2>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {lesson.lessonContent}
                        </p>
                    </li>
                ))}
            </ul>
        </main>
    );
}