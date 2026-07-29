"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { Prisma } from "../../../src/generated/prisma";

export async function awardLessonReward(lessonId: number) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    //validate lessonId with Zod before db query
    const lessonIdSchema = z.number().int().positive();
    const validatedLessonId = lessonIdSchema.parse(lessonId);

    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
    });
    if (!user) {
        throw new Error("User not found");
    }

    const lesson = await db.lesson.findUnique({
        where: { id: validatedLessonId },
        select: { currencyReward: true },
    });

    if (!lesson) {
        throw new Error("Lesson not found");
    }

    try {
        await db.$transaction(
            [
                db.userLessonProgress.create({
                    data: {
                        userId: user.id,
                        lessonId: validatedLessonId,
                        isCompleted: true,
                    }
                }),
                db.user.update({
                    where: { clerkId: userId },
                    data: {
                        mockBalance: { increment: lesson.currencyReward }
                    }
                })
            ]
        );
        return { awarded: true, message: "Reward awarded successfully" };
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                // This error code indicates a unique constraint violation, which means the user has already completed this lesson.
                return { awarded: false, message: "Lesson already completed" };
        }
        throw error; // rethrow other errors
    }
}