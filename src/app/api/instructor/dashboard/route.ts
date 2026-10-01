import { NextResponse } from "next/server";
import { eq, and, count, countDistinct, or } from "drizzle-orm";

import { db } from "@/db";
import { courses, enrollment, courseBuilderDraft } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();

    // Check authentication
    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Only instructors can access this dashboard
    if (user.role !== "instructor") {
      return NextResponse.json(
        {
          message: "Only instructors can access the dashboard",
        },
        { status: 403 },
      );
    }

    // Total courses (published + drafts from courses table)
    const totalCoursesResult = await db
      .select({
        count: count(),
      })
      .from(courses)
      .where(eq(courses.instructorId, user.id));

    // Published courses
    const publishedCoursesResult = await db
      .select({
        count: count(),
      })
      .from(courses)
      .where(
        and(
          eq(courses.instructorId, user.id),
          eq(courses.status, "published"),
        ),
      );

    // Draft courses from courses table
    const draftCoursesResult = await db
      .select({
        count: count(),
      })
      .from(courses)
      .where(
        and(
          eq(courses.instructorId, user.id),
          eq(courses.status, "draft"),
        ),
      );

    // Draft courses from course_builder_draft table (active + completed only)
    const builderDraftsResult = await db
      .select({
        count: count(),
      })
      .from(courseBuilderDraft)
      .where(
        and(
          eq(courseBuilderDraft.instructorId, user.id),
          or(
            eq(courseBuilderDraft.status, "active"),
            eq(courseBuilderDraft.status, "completed")
          )
        )
      );

    // Unique students enrolled in this instructor's courses
    const studentsResult = await db
      .select({
        count: countDistinct(enrollment.userId),
      })
      .from(enrollment)
      .innerJoin(
        courses,
        eq(enrollment.courseId, courses.id),
      )
      .where(eq(courses.instructorId, user.id));

    // Total courses = published + drafts from courses table + active builder drafts
    const totalCourses = (totalCoursesResult[0]?.count ?? 0) + (builderDraftsResult[0]?.count ?? 0);
    const draftCourses = (draftCoursesResult[0]?.count ?? 0) + (builderDraftsResult[0]?.count ?? 0);

    return NextResponse.json(
      {
        message: "Dashboard data fetched successfully",
        data: {
          totalCourses,
          publishedCourses: publishedCoursesResult[0]?.count ?? 0,
          draftCourses,
          students: studentsResult[0]?.count ?? 0,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get instructor dashboard error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch dashboard data",
      },
      { status: 500 },
    );
  }
}