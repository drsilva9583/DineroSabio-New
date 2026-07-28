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
            <h1 className="text-3xl mb-4 text-ink">{course.courseTitle}</h1>
            <ul className="flex flex-col gap-4 mt-6">
                {course.lessons.map((lesson) => (
                    <li
                        key={lesson.id}
                        className="border border-border bg-surface rounded-2xl p-4 hover:shadow-md transition-shadow"
                    >
                        <h2 className="text-xl font-semibold text-ink">{lesson.lessonTitle}</h2>
                        <p className="text-sm text-ink-soft mt-1 line-clamp-2">
                            {lesson.lessonContent}
                        </p>
                    </li>
                ))}
            </ul>
        </main>
    );
}