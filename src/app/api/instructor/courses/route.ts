import { NextResponse } from "next/server";
import { eq, and, or } from "drizzle-orm";

import { db } from "@/db";
import { courses, courseBuilderDraft } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";


export async function GET() {
  try {
    // 1. Get the currently authenticated user
    const user = await getCurrentUser();

    // 2. Check authentication
    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // 3. Only instructors can access this API
    if (user.role !== "instructor") {
      return NextResponse.json(
        {
          message: "Only instructors can access their courses",
        },
        { status: 403 },
      );
    }

    // 4. Get courses created by the logged-in instructor
    const instructorCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        thumbnail: courses.thumbnail,
        price: courses.price,
        level: courses.level,
        status: courses.status,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        publishedAt: courses.publishedAt,
      })
      .from(courses)
      .where(eq(courses.instructorId, user.id));

    // 5. Get draft courses from course_builder_draft table (only active/completed)
    const draftCourses = await db
      .select({
        id: courseBuilderDraft.id,
        uuid: courseBuilderDraft.uuid,
        instructorId: courseBuilderDraft.instructorId,
        sessionId: courseBuilderDraft.sessionId,
        status: courseBuilderDraft.status,
        currentStep: courseBuilderDraft.currentStep,
        completionPct: courseBuilderDraft.completionPct,
        version: courseBuilderDraft.version,
        draftData: courseBuilderDraft.draftData,
        createdAt: courseBuilderDraft.createdAt,
        updatedAt: courseBuilderDraft.updatedAt,
        expiresAt: courseBuilderDraft.expiresAt,
        lastActivityAt: courseBuilderDraft.lastActivityAt,
        sourceCourseId: courseBuilderDraft.sourceCourseId,
      })
      .from(courseBuilderDraft)
      .where(
        and(
          eq(courseBuilderDraft.instructorId, user.id),
          // Only show active and completed drafts, not expired/abandoned/published
          or(
            eq(courseBuilderDraft.status, "active"),
            eq(courseBuilderDraft.status, "completed")
          )
        )
      );

    // 6. Transform draft data to match Course type
    const transformedDrafts = draftCourses.map((draft) => {
      const draftData = draft.draftData as { course?: { title?: string; description?: string; thumbnail?: unknown; price?: number; level?: string } } | null;
      const courseData = draftData?.course || {};
      return {
        id: -draft.id, // Negative ID to distinguish drafts from published courses
        uuid: draft.uuid,
        title: courseData.title || "Untitled Course",
        description: courseData.description || "",
        thumbnail: courseData.thumbnail || null,
        price: courseData.price || 0,
        level: courseData.level || "beginner",
        status: "draft" as const,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
        publishedAt: null,
         isDraft: true, // Flag to identify draft courses
        // New fields from draft schema
        draftStatus: draft.status,
        currentStep: draft.currentStep,
        completionPct: draft.completionPct,
        version: draft.version,
        expiresAt: draft.expiresAt,
        lastActivityAt: draft.lastActivityAt,
        sourceCourseId: draft.sourceCourseId,
      };
    });

    // 7. Combine published courses and draft courses
    // Draft courses appear first (most recent first), then published courses
    const allCourses = [
      ...transformedDrafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      ...instructorCourses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    ];

    // 8. Return the instructor's courses
    return NextResponse.json(
      {
        message: "Courses fetched successfully",
        data: allCourses,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get instructor courses error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch courses",
      },
      { status: 500 },
    );
  }
}