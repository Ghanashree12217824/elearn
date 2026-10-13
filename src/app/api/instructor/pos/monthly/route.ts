import { NextResponse } from "next/server";
import { eq, and, count, sum, sql, desc, gte } from "drizzle-orm";

import { db } from "@/db";
import { courses, enrollment } from "@/db/schema";
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

    const now = new Date();
    const currentYear = now.getFullYear();
    const yearStart = new Date(currentYear, 0, 1); // January 1st of current year
    const yearEnd = new Date(currentYear + 1, 0, 1); // January 1st of next year

    const monthlyEnrollments = await db
      .select({
        year: sql<number>`YEAR(${enrollment.enrolledAt})`.as("year"),
        month: sql<number>`MONTH(${enrollment.enrolledAt})`.as("month"),
        enrollmentCount: count(),
        revenue: sum(courses.price),
      })
      .from(enrollment)
      .innerJoin(courses, eq(enrollment.courseId, courses.id))
      .where(
        and(
          eq(courses.instructorId, user.id),
          gte(enrollment.enrolledAt, yearStart),
          sql`${enrollment.enrolledAt} < ${yearEnd}`,
        ),
      )
      .groupBy(
        sql`YEAR(${enrollment.enrolledAt})`,
        sql`MONTH(${enrollment.enrolledAt})`,
      )
      .orderBy(
        sql`YEAR(${enrollment.enrolledAt})`,
        sql`MONTH(${enrollment.enrolledAt})`,
      );

    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const date = new Date(currentYear, month - 1, 1);
      const year = date.getFullYear();

      const found = monthlyEnrollments.find(
        (m) => m.year === year && m.month === month,
      );

      monthlyData.push({
        label: date.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        month: month,
        year: year,
        enrollments: found ? Number(found.enrollmentCount) : 0,
        revenue: found ? Number(found.revenue ?? 0) : 0,
      });
    }

    return NextResponse.json({
      message: "Monthly POS analytics fetched successfully",
      data: monthlyData,
    }, { status: 200 });
  } catch (error) {
    console.error("Get monthly POS analytics error:", error);

    return NextResponse.json(
      { message: "Failed to fetch monthly POS analytics data" },
      { status: 500 },
    );
  }
}