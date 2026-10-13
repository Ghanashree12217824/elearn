import { NextResponse } from "next/server";
import { eq, and, count, countDistinct, desc } from "drizzle-orm";

import { db } from "@/db";
import { courses, enrollment, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "instructor") {
      return NextResponse.json(
        { message: "Only instructors can access POS analytics" },
        { status: 403 },
      );
    }

    // Total unique students enrolled in this instructor's courses
    const uniqueStudentsResult = await db
      .select({
        count: countDistinct(enrollment.userId),
      })
      .from(enrollment)
      .innerJoin(courses, eq(enrollment.courseId, courses.id))
      .where(eq(courses.instructorId, user.id));

    // Total course enrollments (one student in multiple courses counts multiple times)
    const totalEnrollmentsResult = await db
      .select({
        count: count(),
      })
      .from(enrollment)
      .innerJoin(courses, eq(enrollment.courseId, courses.id))
      .where(eq(courses.instructorId, user.id));

    // Per-course enrollment breakdown
    const courseEnrollments = await db
      .select({
        courseId: courses.id,
        title: courses.title,
        price: courses.price,
        level: courses.level,
        status: courses.status,
        enrollmentCount: count(enrollment.userId),
      })
      .from(courses)
      .leftJoin(enrollment, eq(enrollment.courseId, courses.id))
      .where(eq(courses.instructorId, user.id))
      .groupBy(courses.id, courses.title, courses.price, courses.level, courses.status)
      .orderBy(desc(count(enrollment.userId)));

    return NextResponse.json({
      message: "POS analytics fetched successfully",
      data: {
        uniqueStudents: uniqueStudentsResult[0]?.count ?? 0,
        totalEnrollments: totalEnrollmentsResult[0]?.count ?? 0,
        courseEnrollments: courseEnrollments.map((c) => ({
          courseId: c.courseId,
          title: c.title,
          price: c.price,
          level: c.level,
          status: c.status,
          enrollmentCount: Number(c.enrollmentCount),
        })),
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Get POS analytics error:", error);

    return NextResponse.json(
      { message: "Failed to fetch POS analytics data" },
      { status: 500 },
    );
  }
}