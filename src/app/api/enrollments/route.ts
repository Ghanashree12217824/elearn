import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { enrollment, courses, categories, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const enrolledCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        thumbnail: courses.thumbnail,
        category: categories.name,
        level: courses.level,
        price: courses.price,
        status: courses.status,
        instructorId: courses.instructorId,
        instructorName: users.username,
        enrolledAt: sql`MAX(${enrollment.enrolledAt})`.as("enrolled_at"),
        enrollmentStatus: sql`MAX(${enrollment.status})`.as("enrollment_status"),
        totalLessons: sql<number>`(
          SELECT COUNT(*) FROM lessons
          INNER JOIN modules ON lessons.module_id = modules.id
          WHERE modules.course_id = courses.id
        )`.as("total_lessons"),
      })
      .from(enrollment)
      .innerJoin(courses, eq(enrollment.courseId, courses.id))
      .innerJoin(categories, eq(courses.categoryId, categories.id))
      .innerJoin(users, eq(courses.instructorId, users.id))
      .where(
        and(
          eq(enrollment.userId, userId),
          eq(enrollment.status, "active")
        )
      )
      .groupBy(courses.id)
      .orderBy(sql`MAX(${enrollment.enrolledAt})`);

    return NextResponse.json({
      data: enrolledCourses,
    });
  } catch (error) {
    console.error("Get enrollments error:", error);
    return NextResponse.json(
      { message: "Failed to fetch enrollments" },
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
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, userId),
          eq(enrollment.courseId, courseId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create enrollment
    const newEnrollment = await db
      .insert(enrollment)
      .values({
        userId,
        courseId,
        enrolledAt: new Date(),
        status: "active",
        id: `enroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

    return NextResponse.json(
      { message: "Enrolled successfully", data: newEnrollment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enroll error:", error);
    return NextResponse.json(
      { message: "Failed to enroll" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    await db
      .delete(enrollment)
      .where(
        and(
          eq(enrollment.userId, userId),
          eq(enrollment.courseId, parseInt(courseId))
        )
      );

    return NextResponse.json(
      { message: "Unenrolled successfully" }
    );
  } catch (error) {
    console.error("Unenroll error:", error);
    return NextResponse.json(
      { message: "Failed to unenroll" },
      { status: 500 }
    );
  }
}