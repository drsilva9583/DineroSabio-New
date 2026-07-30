import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Quiz from "@/components/dashboard/Quiz";

interface Props {
    params: Promise<{ courseId: string, lessonId: string }>;
}

export default async function LessonDetailPage({ params }: Props) {
    const { lessonId: lessonIdStr } = await params;
    const lessonId = Number(lessonIdStr);
    if (Number.isNaN(lessonId)) {
        return notFound();
    }

    const lesson = await db.lesson.findUnique({
        where: { id: lessonId },
        include: {
            quizzes: { orderBy: { id: "asc" } },
        },
    });
    if (!lesson) {
        return notFound();
    }

    return (
        <main className="p-6">
            <h1 className="text-3xl mb-4 text-ink">{lesson.lessonTitle}</h1>
            <p className="mt-1">
                {lesson.lessonContent}
            </p>
            <div className="mt-6">
                {lesson.quizzes.length === 0 ? (
                    <p>No quizzes available for this lesson.</p>
                ) : (
                    <Quiz questions={lesson.quizzes} lessonId={lessonId} />
                )}
            </div>
        </main>
    );
}