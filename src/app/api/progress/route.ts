import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { studentProgress, courses, lessons, modules } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    let whereClause = and(
      eq(studentProgress.userId, userId)
    );

    if (courseId) {
      whereClause = and(
        eq(studentProgress.userId, userId),
        eq(studentProgress.courseId, Number(courseId))
      );
    }

    const progressRows = await db
      .select({
        id: studentProgress.id,
        userId: studentProgress.userId,
        courseId: studentProgress.courseId,
        lessonId: studentProgress.lessonId,
        completed: studentProgress.completed,
        completedAt: studentProgress.completedAt,
        createdAt: studentProgress.createdAt,
        updatedAt: studentProgress.updatedAt,
        lessonTitle: lessons.title,
        moduleTitle: modules.title,
        courseTitle: courses.title,
      })
      .from(studentProgress)
      .leftJoin(
        lessons,
        eq(studentProgress.lessonId, lessons.id)
      )
      .leftJoin(
        modules,
        eq(lessons.moduleId, modules.id)
      )
      .leftJoin(
        courses,
        eq(studentProgress.courseId, courses.id)
      )
      .where(whereClause)
      .orderBy(desc(studentProgress.createdAt));

    return NextResponse.json({
      data: progressRows,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { message: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();
    const { courseId, lessonId, completed } = body;

    if (!courseId || !lessonId) {
      return NextResponse.json(
        { message: "Course ID and Lesson ID are required" },
        { status: 400 }
      );
    }

    const isCompleted = completed === true || completed === 1;

    const existing = await db
      .select()
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, userId),
          eq(studentProgress.courseId, courseId),
          eq(studentProgress.lessonId, lessonId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(studentProgress)
        .set({
          completed: isCompleted ? 1 : 0,
          completedAt: isCompleted ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(studentProgress.id, existing[0].id));

      return NextResponse.json({
        message: "Progress updated",
        data: existing[0],
      });
    }

    const newProgress = await db
      .insert(studentProgress)
      .values({
        userId,
        courseId,
        lessonId,
        completed: isCompleted ? 1 : 0,
        completedAt: isCompleted ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    return NextResponse.json(
      {
        message: "Progress recorded",
        data: newProgress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Update progress error:", error);
    return NextResponse.json(
      { message: "Failed to update progress" },
      { status: 500 }
    );
  }
}
