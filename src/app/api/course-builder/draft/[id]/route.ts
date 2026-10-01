import { NextResponse } from "next/server";

import { db } from "@/db";
import { courseBuilderDraft } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          reason: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    if (user.role !== "instructor") {
      return NextResponse.json(
        {
          message: "Forbidden",
          reason: "Only instructors can access course drafts.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Support both numeric ID and UUID
    const isUuid = id.length === 36 && id.includes("-");
    const whereClause = isUuid
      ? eq(courseBuilderDraft.uuid, id)
      : eq(courseBuilderDraft.id, Number(id));

    const drafts = await db
      .select()
      .from(courseBuilderDraft)
      .where(
        and(
          whereClause,
          eq(courseBuilderDraft.instructorId, user.id)
        )
      )
      .limit(1);

    if (drafts.length === 0) {
      return NextResponse.json(
        {
          message: "Draft not found",
        },
        { status: 404 }
      );
    }

    const draft = drafts[0];

    // Update last activity timestamp
    await db
      .update(courseBuilderDraft)
      .set({ lastActivityAt: new Date() })
      .where(eq(courseBuilderDraft.id, draft.id));

    return NextResponse.json({
      message: "Course draft retrieved successfully.",

      draft: {
        id: draft.id,
        uuid: draft.uuid,

        instructorId: draft.instructorId,
        sessionId: draft.sessionId,

        status: draft.status,
        currentStep: draft.currentStep,
        completionPct: draft.completionPct,
        version: draft.version,

        draftData: draft.draftData,

        sourceCourseId: draft.sourceCourseId,

        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
        expiresAt: draft.expiresAt,
        lastActivityAt: draft.lastActivityAt,
      },
    });
  } catch (error) {
    console.error("Course draft GET by ID error:", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve course draft.",
        reason: "An unexpected server or database error occurred.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          reason: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    if (user.role !== "instructor") {
      return NextResponse.json(
        {
          message: "Forbidden",
          reason: "Only instructors can delete course drafts.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Support both numeric ID and UUID
    const isUuid = id.length === 36 && id.includes("-");
    const whereClause = isUuid
      ? eq(courseBuilderDraft.uuid, id)
      : eq(courseBuilderDraft.id, Number(id));

    const drafts = await db
      .select()
      .from(courseBuilderDraft)
      .where(
        and(
          whereClause,
          eq(courseBuilderDraft.instructorId, user.id)
        )
      )
      .limit(1);

    if (drafts.length === 0) {
      return NextResponse.json(
        {
          message: "Draft not found",
        },
        { status: 404 }
      );
    }

    const draft = drafts[0];

    // Delete the draft
    await db
      .delete(courseBuilderDraft)
      .where(eq(courseBuilderDraft.id, draft.id));

    return NextResponse.json({
      message: "Course draft deleted successfully.",
    });
  } catch (error) {
    console.error("Course draft DELETE error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete course draft.",
        reason: "An unexpected server or database error occurred.",
      },
      { status: 500 }
    );
  }
}