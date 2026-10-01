import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { db } from "@/db";
import { courseBuilderDraft } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

import { eq, and, desc, or } from "drizzle-orm";

import type {
  CourseBuilderDraft,
} from "@/types/course-builder";

async function processThumbnail(
  thumbnailFile: File,
  requestUrl: string,
) {
  if (!thumbnailFile.type.startsWith("image/")) {
    return null;
  }

  const extension =
    thumbnailFile.name.split(".").pop()?.toLowerCase() || "jpg";

  const fileName = `${randomUUID()}.${extension}`;

  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "courses",
  );

  await mkdir(uploadDirectory, { recursive: true });

  const filePath = path.join(uploadDirectory, fileName);

  const bytes = await thumbnailFile.arrayBuffer();

  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  const origin = new URL(requestUrl).origin;

  const thumbnailUrl = `${origin}/uploads/courses/${fileName}`;

  return {
    url: thumbnailUrl,
    fileName: thumbnailFile.name,
    fileSize: thumbnailFile.size,
    mimeType: thumbnailFile.type,
  };
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

export async function POST(request: Request) {
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
          reason:
            "Only instructors can create course drafts.",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const draftDataField = formData.get("draftData");

    const thumbnailFile =
      formData.get("thumbnail") instanceof File
        ? (formData.get("thumbnail") as File)
        : null;

    const courseCode = formData.get("courseCode") as string | null;
    const currentStep = formData.get("currentStep") as string | null;
    const completionPct = formData.get("completionPct") as string | null;
    const status = formData.get("status") as string | null;

    const sourceCourseIdField = formData.get("sourceCourseId") as string | null;
    const sourceCourseId = sourceCourseIdField
      ? Number(sourceCourseIdField)
      : null;

    if (!draftDataField || typeof draftDataField !== "string") {
      return NextResponse.json(
        {
          message: "Draft data is required.",
          reason:
            "The course builder did not send any course data.",
        },
        { status: 400 }
      );
    }

    const draftData = JSON.parse(draftDataField);

    if (thumbnailFile) {
      const thumbnailData = await processThumbnail(
        thumbnailFile,
        request.url,
      );

      if (thumbnailData) {
        draftData.course.thumbnail = thumbnailData;
      }
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days TTL
    const newVersion = 1;

    // ============================================================
    // DEDUPLICATION LOGIC
    // ============================================================
    // Priority 1: sourceCourseId — pending changes for a published
    //             course.  This path is used by the edit-page "Save
    //             as Draft" feature.
    // Priority 2: courseCode (uuid) — stable identifier across
    //             sessions in the create flow.
    // Priority 3: instructor + normalized course title (fallback).
    let existingDraft: {
      id: number;
      uuid: string;
      version: number;
      currentStep: number;
      completionPct: number;
      draftData: CourseBuilderDraft;
    } | null = null;

    // Priority 1: Look up by sourceCourseId
    // ---------------------------------------------
    // When a sourceCourseId is provided we look ONLY by it.
    // This ensures pending-change drafts are completely
    // isolated from the create-flow deduplication path.
    if (sourceCourseId) {
      const [sourceDraft] = await db
        .select()
        .from(courseBuilderDraft)
        .where(
          and(
            eq(courseBuilderDraft.sourceCourseId, sourceCourseId),
            eq(courseBuilderDraft.instructorId, user.id),
            or(
              eq(courseBuilderDraft.status, "active"),
              eq(courseBuilderDraft.status, "completed")
            )
          )
        )
        .orderBy(desc(courseBuilderDraft.updatedAt))
        .limit(1);

      existingDraft = sourceDraft as unknown as typeof existingDraft;
    }

    // Priority 2: Look up by courseCode (uuid) — create flow only
    // ---------------------------------------------
    if (!existingDraft && courseCode && !sourceCourseId) {
      const [codeDraft] = await db
        .select()
        .from(courseBuilderDraft)
        .where(
          and(
            eq(courseBuilderDraft.uuid, courseCode),
            eq(courseBuilderDraft.instructorId, user.id),
            or(
              eq(courseBuilderDraft.status, "active"),
              eq(courseBuilderDraft.status, "completed")
            )
          )
        )
        .orderBy(desc(courseBuilderDraft.updatedAt))
        .limit(1);

      existingDraft = codeDraft as unknown as typeof existingDraft;
    }

    // Priority 3: Look up by instructor + normalized title (create flow fallback only)
    if (!existingDraft && draftData.course?.title && !sourceCourseId) {
      const normalizedTitle = normalizeTitle(draftData.course.title);
      const instructorDrafts = await db
        .select()
        .from(courseBuilderDraft)
        .where(
          and(
            eq(courseBuilderDraft.instructorId, user.id),
            or(
              eq(courseBuilderDraft.status, "active"),
              eq(courseBuilderDraft.status, "completed")
            )
          )
        )
        .orderBy(desc(courseBuilderDraft.updatedAt))
        .limit(10);

      // Find draft with matching normalized title
      for (const d of instructorDrafts as Array<{
        id: number;
        uuid: string;
        version: number;
        currentStep: number;
        completionPct: number;
        draftData: CourseBuilderDraft;
      }>) {
        const existingTitle = d.draftData?.course?.title;
        if (existingTitle && normalizeTitle(existingTitle) === normalizedTitle) {
          existingDraft = d;
          break;
        }
      }
    }

    let draftId: number;
    let draftUuid: string;
    let finalVersion: number;

    if (existingDraft) {
      // UPDATE existing draft - increment version
      finalVersion = existingDraft.version + 1;

      await db
        .update(courseBuilderDraft)
        .set({
          draftData,
          status: (status as "active" | "completed" | "published" | "abandoned" | "expired") || "active",
          currentStep: currentStep ? parseInt(currentStep, 10) : existingDraft.currentStep,
          completionPct: completionPct ? parseInt(completionPct, 10) : existingDraft.completionPct,
          version: finalVersion,
          updatedAt: now,
          expiresAt,
          lastActivityAt: now,
          sourceCourseId: sourceCourseId,
        })
        .where(eq(courseBuilderDraft.id, existingDraft.id));

      draftId = existingDraft.id;
      draftUuid = existingDraft.uuid;

      // Clean up older duplicate drafts for same course title (keep only latest)
      // Only applies to the create-flow (title-based dedup), not sourceCourseId.
      if (draftData.course?.title && !sourceCourseId) {
        const normalizedTitle = normalizeTitle(draftData.course.title);
        const duplicates = await db
          .select()
          .from(courseBuilderDraft)
          .where(
            and(
              eq(courseBuilderDraft.instructorId, user.id),
              or(
                eq(courseBuilderDraft.status, "active"),
                eq(courseBuilderDraft.status, "completed")
              )
            )
          )
          .orderBy(desc(courseBuilderDraft.updatedAt));

        for (const dup of duplicates as Array<{ id: number; draftData: CourseBuilderDraft }>) {
          if (dup.id === draftId) continue;
          const dupTitle = dup.draftData?.course?.title;
          if (dupTitle && normalizeTitle(dupTitle) === normalizedTitle) {
            await db
              .delete(courseBuilderDraft)
              .where(eq(courseBuilderDraft.id, dup.id));
          }
        }
      }
    } else {
      // INSERT new draft
      // - Create flow: use courseCode as uuid
      // - Edit flow (sourceCourseId): generate a fresh UUID since
      //   dedup is by sourceCourseId, not by uuid.
      draftUuid = sourceCourseId
        ? randomUUID()
        : (courseCode || randomUUID());

      const result = await db
        .insert(courseBuilderDraft)
        .values({
          uuid: draftUuid,
          instructorId: user.id,
          sessionId: null,
          draftData,
          status: (status as "active" | "completed" | "published" | "abandoned" | "expired") || "active",
          currentStep: currentStep ? parseInt(currentStep, 10) : 1,
          completionPct: completionPct ? parseInt(completionPct, 10) : 0,
          version: newVersion,
          createdAt: now,
          updatedAt: now,
          expiresAt,
          lastActivityAt: now,
          sourceCourseId: sourceCourseId,
          tags: null,
        });

      draftId = result[0].insertId;
      finalVersion = newVersion;
    }

    return NextResponse.json(
      {
        message: existingDraft
          ? "Course draft updated successfully."
          : "Course draft created successfully.",
        draftId,
        uuid: draftUuid,
        version: finalVersion,
        sourceCourseId: sourceCourseId || null,
      },
      { status: existingDraft ? 200 : 201 }
    );
  } catch (error) {
    console.error(
      "Course draft POST error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to save course draft.",
        reason:
          "An unexpected server or database error occurred.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
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
          reason:
            "Only instructors can access course drafts.",
        },
        { status: 403 }
      );
    }

    const drafts = await db
      .select()
      .from(courseBuilderDraft)
      .where(
        and(
          eq(courseBuilderDraft.instructorId, user.id),
          eq(courseBuilderDraft.status, "active")
        )
      )
      .orderBy(desc(courseBuilderDraft.updatedAt));

    /*
     * NO DRAFTS
     */
    if (drafts.length === 0) {
      return NextResponse.json({
        message: "No active course drafts found.",
        drafts: [],
      });
    }

    return NextResponse.json({
      message:
        "Course drafts retrieved successfully.",

      drafts: drafts.map((draft) => ({
        id: draft.id,
        uuid: draft.uuid,

        instructorId:
          draft.instructorId,

        sessionId:
          draft.sessionId,

        status:
          draft.status,

        currentStep:
          draft.currentStep,

        completionPct:
          draft.completionPct,

        version:
          draft.version,

        draftData:
          draft.draftData,

        sourceCourseId:
          draft.sourceCourseId,

        createdAt:
          draft.createdAt,

        updatedAt:
          draft.updatedAt,

        expiresAt:
          draft.expiresAt,

        lastActivityAt:
          draft.lastActivityAt,
      })),
    });
  } catch (error) {
    console.error(
      "Course draft GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to retrieve course drafts.",
        reason:
          "An unexpected server or database error occurred.",
      },
      { status: 500 }
    );
  }
}
