import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { db } from "@/db";
import {
  courseBuilderDraft,
  courses,
  modules,
  lessons,
  lessonResources,
  tags,
  courseTags,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/auth";

import { eq, and, or, desc } from "drizzle-orm";

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
    /*
     * ============================================
     * 1. CHECK AUTHENTICATION
     * ============================================
     */

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

    /*
     * ============================================
     * 2. CHECK INSTRUCTOR ROLE
     * ============================================
     */

    if (user.role !== "instructor") {
      return NextResponse.json(
        {
          message: "Forbidden",
          reason:
            "Only instructors can publish courses.",
        },
        { status: 403 }
      );
    }

    /*
     * ============================================
     * 3. PROCESS UPLOADED THUMBNAIL (if provided)
     * ============================================
     */

    const formData = await request.formData();

    const thumbnailFile =
      formData.get("thumbnail") instanceof File
        ? (formData.get("thumbnail") as File)
        : null;

    const sourceCourseIdField = formData.get("sourceCourseId") as string | null;
    const sourceCourseId = sourceCourseIdField
      ? Number(sourceCourseIdField)
      : null;

    let uploadedThumbnail = null;

    if (thumbnailFile) {
      uploadedThumbnail = await processThumbnail(
        thumbnailFile,
        request.url,
      );
    }

    /*
      * ============================================
      * 4. GET SAVED BUILDER DRAFT
      * ============================================
      */

    let draft;

    if (sourceCourseId) {
      /*
       * When sourceCourseId is present (publishing
       * pending changes from the edit page), fetch
       * the draft linked to that specific published
       * course.  Status filter ensures we only pick
       * active/completed drafts.
       */
      const sourceDrafts = await db
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

      if (sourceDrafts.length === 0) {
        return NextResponse.json(
          {
            message: "No pending draft found for this course.",
            reason:
              "Save changes as draft before publishing.",
          },
          { status: 404 }
        );
      }

      draft = sourceDrafts[0];
    } else {
      /*
       * Create-flow path: fetch the most recent
       * active/completed draft for the instructor.
       */
      const drafts = await db
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
        .limit(1);

      if (drafts.length === 0) {
        return NextResponse.json(
          {
            message: "No course draft found.",
            reason:
              "Save the course as a draft before publishing.",
          },
          { status: 404 }
        );
      }

      draft = drafts[0];
    }

    /*
     * ============================================
     * 5. READ DRAFT JSON
     * ============================================
     */

    const draftData =
      draft.draftData as CourseBuilderDraft;

    if (!draftData?.course) {
      return NextResponse.json(
        {
          message: "Invalid course draft.",
          reason:
            "The saved draft does not contain course information.",
        },
        { status: 400 }
      );
    }

    const courseData = draftData.course;

    /*
     * ============================================
     * 6. USE UPLOADED THUMBNAIL OR EXISTING
     * ============================================
     */

    const thumbnail = uploadedThumbnail ?? courseData.thumbnail;

    /*
     * ============================================
     * 7. BASIC VALIDATION
     * ============================================
     */

    if (!courseData.title?.trim()) {
      return NextResponse.json(
        {
          message: "Course title is required.",
          reason:
            "Enter a course title before publishing.",
        },
        { status: 400 }
      );
    }

    if (!courseData.description?.trim()) {
      return NextResponse.json(
        {
          message:
            "Course description is required.",
          reason:
            "Enter a course description before publishing.",
        },
        { status: 400 }
      );
    }

    const category = courseData.category;

    if (!category) {
      return NextResponse.json(
        {
          message: "Course category is required.",
          reason:
            "Select a category before publishing.",
        },
        { status: 400 }
      );
    }

    if (!thumbnail) {
      return NextResponse.json(
        {
          message:
            "Course thumbnail is required.",
          reason:
            "Upload a course thumbnail before publishing.",
        },
        { status: 400 }
      );
    }

    /*
      * ============================================
      * 8. CHECK FOR EXISTING PUBLISHED COURSE (DEDUPLICATION)
      * ============================================
      */

    let existingCourse = null;

    if (sourceCourseId) {
      /*
       * Publishing pending changes to an already-published
       * course.  Look up the course directly by ID instead
       * of title matching (which fails if the title was
       * changed during editing).
       */
      const [directCourse] = await db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.id, sourceCourseId),
            eq(courses.instructorId, user.id)
          )
        )
        .limit(1);

      existingCourse = directCourse ?? null;

      if (!existingCourse) {
        return NextResponse.json(
          {
            message: "Published course not found.",
            reason:
              "The source course could not be found or you do not have permission.",
          },
          { status: 404 }
        );
      }
    } else {
      /*
       * Create-flow path: find existing published course
       * by normalized title matching.
       */
      const normalizedTitle =
        normalizeTitle(courseData.title);
      const existingPublished = await db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.instructorId, user.id),
            eq(courses.status, "published")
          )
        );

      for (const c of existingPublished) {
        if (c.title && normalizeTitle(c.title) === normalizedTitle) {
          existingCourse = c;
          break;
        }
      }
    }

    /*
     * ============================================
     * 9. DATABASE TRANSACTION
     * ============================================
     */

    const result = await db.transaction(
      async (tx) => {
        let courseId: number;
        let isUpdate = false;

        if (existingCourse) {
          // UPDATE existing published course
          isUpdate = true;
          courseId = existingCourse.id;

          await tx
            .update(courses)
            .set({
              title: courseData.title,
              description: courseData.description,
              thumbnail: thumbnail,
              categoryId: category.id,
              price: courseData.price,
              level: courseData.level,
              updatedAt: new Date(),
            })
            .where(eq(courses.id, courseId));

          // Update tags
          await tx.delete(courseTags).where(eq(courseTags.courseId, courseId));

          for (const tag of courseData.tags) {
            const existingTag = await tx
              .select()
              .from(tags)
              .where(eq(tags.name, tag.name))
              .limit(1);

            let tagId: number;

            if (existingTag.length > 0) {
              tagId = existingTag[0].id;
            } else {
              const tagResult = await tx
                .insert(tags)
                .values({ name: tag.name });

              tagId = Number(tagResult[0].insertId);
            }

            await tx.insert(courseTags).values({ courseId, tagId });
          }

          // Delete existing modules/lessons/resources
          const existingModules = await tx
            .select({ id: modules.id })
            .from(modules)
            .where(eq(modules.courseId, courseId));

          for (const m of existingModules) {
            const existingLessons = await tx
              .select({ id: lessons.id })
              .from(lessons)
              .where(eq(lessons.moduleId, m.id));

            for (const l of existingLessons) {
              await tx
                .delete(lessonResources)
                .where(eq(lessonResources.lessonId, l.id));
            }

            await tx.delete(lessons).where(eq(lessons.moduleId, m.id));
          }

          await tx.delete(modules).where(eq(modules.courseId, courseId));
        } else {
          // CREATE new course
          const courseResult = await tx
            .insert(courses)
            .values({
              title: courseData.title,
              description: courseData.description,
              thumbnail: thumbnail,
              instructorId: user.id,
              categoryId: category.id,
              price: courseData.price,
              level: courseData.level,
              status: "published",
              createdAt: new Date(),
              updatedAt: new Date(),
              publishedAt: new Date(),
            });

          courseId = Number(courseResult[0].insertId);

          // Create tags
          for (const tag of courseData.tags) {
            const existingTag = await tx
              .select()
              .from(tags)
              .where(eq(tags.name, tag.name))
              .limit(1);

            let tagId: number;

            if (existingTag.length > 0) {
              tagId = existingTag[0].id;
            } else {
              const tagResult = await tx
                .insert(tags)
                .values({ name: tag.name });

              tagId = Number(tagResult[0].insertId);
            }

            await tx.insert(courseTags).values({ courseId, tagId });
          }
        }

        // ========================================
        // CREATE/RECREATE MODULES
        // ========================================

        for (
          let moduleIndex = 0;
          moduleIndex < draftData.modules.length;
          moduleIndex++
        ) {
          const moduleData = draftData.modules[moduleIndex];

          const moduleResult = await tx
            .insert(modules)
            .values({
              courseId,
              title: moduleData.title,
              description: moduleData.description,
              position: moduleIndex,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

          const moduleId = Number(moduleResult[0].insertId);

          // ======================================
          // CREATE LESSONS
          // ======================================

          for (
            let lessonIndex = 0;
            lessonIndex < moduleData.lessons.length;
            lessonIndex++
          ) {
            const lessonData = moduleData.lessons[lessonIndex];

            const lessonResult = await tx
              .insert(lessons)
              .values({
                moduleId,
                title: lessonData.title,
                description: lessonData.description,
                content: lessonData.content,
                position: lessonIndex,
                createdAt: new Date(),
                updatedAt: new Date(),
              });

            const lessonId = Number(lessonResult[0].insertId);

            // ====================================
            // CREATE LESSON RESOURCES
            // ====================================

            for (
              let resourceIndex = 0;
              resourceIndex < lessonData.resources.length;
              resourceIndex++
            ) {
              const resource = lessonData.resources[resourceIndex];

              await tx.insert(lessonResources).values({
                lessonId,
                title: resource.title,
                metadata: resource.metadata,
                position: resourceIndex,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          }
        }

        // ========================================
        // DELETE BUILDER DRAFT
        // ========================================

        await tx
          .delete(courseBuilderDraft)
          .where(eq(courseBuilderDraft.id, draft.id));

        // ========================================
        // RETURN CREATED/UPDATED COURSE
        // ========================================

        const slug =
          courseData.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") +
          "-" +
          Date.now();

        return {
          id: courseId,
          title: courseData.title,
          slug,
          status: "published",
          isUpdate,
        };
      }
    );

    /*
     * ============================================
     * SUCCESS RESPONSE
     * ============================================
     */

    return NextResponse.json({
      message: result.isUpdate
        ? "Course updated and published successfully."
        : "Course published successfully.",

      course: result,
    });
  } catch (error) {
    console.error("Publish course error:", error);

    return NextResponse.json(
      {
        message: "Failed to publish course.",
        reason:
          error instanceof Error
            ? error.message
            : "Unknown database or server error.",
      },
      { status: 500 }
    );
  }
}