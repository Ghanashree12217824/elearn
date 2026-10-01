import { NextResponse } from "next/server";
import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  courses,
  categories,
  tags,
  courseTags,
  modules,
  lessons,
  lessonResources,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";


import type {
  CourseBuilderDraft,
  CourseBuilderModule,
  CourseBuilderLesson,
  LessonResource,
} from "@/types/course-builder";

/* =========================================================
   GET COURSE
========================================================= */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    // =======================================================
    // 1. AUTHENTICATION
    // =======================================================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // =======================================================
    // 2. ROLE CHECK
    // =======================================================

    if (user.role !== "instructor") {
      return NextResponse.json(
        {
          message: "Only instructors can access courses",
        },
        { status: 403 },
      );
    }

    // =======================================================
    // 3. COURSE ID
    // =======================================================

    const { courseId } = await params;

    const id = Number(courseId);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          message: "Invalid course ID",
        },
        { status: 400 },
      );
    }

    // =======================================================
    // COURSE
    // =======================================================

    const courseResult = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        thumbnail: courses.thumbnail,
        instructorId: courses.instructorId,
        categoryId: courses.categoryId,
        price: courses.price,
        level: courses.level,
        status: courses.status,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        publishedAt: courses.publishedAt,
      })
      .from(courses)
      .where(and(eq(courses.id, id), eq(courses.instructorId, user.id)))
      .limit(1);

    if (courseResult.length === 0) {
      return NextResponse.json(
        {
          message: "Course not found",
        },
        { status: 404 },
      );
    }

    const course = courseResult[0];

    // =======================================================
    // CATEGORY
    // =======================================================

    let category = null;

    if (course.categoryId) {
      const categoryResult = await db
        .select({
          id: categories.id,
          name: categories.name,
        })
        .from(categories)
        .where(eq(categories.id, course.categoryId))
        .limit(1);

      category = categoryResult[0] ?? null;
    }

    // =======================================================
    // TAGS
    // =======================================================

    const courseTagResults = await db
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(courseTags)
      .innerJoin(tags, eq(courseTags.tagId, tags.id))
      .where(eq(courseTags.courseId, id));

    // =======================================================
    // MODULES
    // =======================================================

    const moduleResults = await db
      .select({
        id: modules.id,
        courseId: modules.courseId,
        title: modules.title,
        description: modules.description,
        position: modules.position,
        createdAt: modules.createdAt,
        updatedAt: modules.updatedAt,
      })
      .from(modules)
      .where(eq(modules.courseId, id))
      .orderBy(asc(modules.position));

    // =======================================================
    // LESSONS + RESOURCES
    // =======================================================

    const modulesWithLessons = [];

    for (const module of moduleResults) {
      const lessonResults = await db
        .select({
          id: lessons.id,
          moduleId: lessons.moduleId,
          title: lessons.title,
          description: lessons.description,
          content: lessons.content,
          position: lessons.position,
          createdAt: lessons.createdAt,
          updatedAt: lessons.updatedAt,
        })
        .from(lessons)
        .where(eq(lessons.moduleId, module.id))
        .orderBy(asc(lessons.position));

      const lessonsWithResources = [];

      for (const lesson of lessonResults) {
        const resourceResults = await db
          .select({
            id: lessonResources.id,
            lessonId: lessonResources.lessonId,
            title: lessonResources.title,
            metadata: lessonResources.metadata,
            position: lessonResources.position,
            createdAt: lessonResources.createdAt,
            updatedAt: lessonResources.updatedAt,
          })
          .from(lessonResources)
          .where(eq(lessonResources.lessonId, lesson.id))
          .orderBy(asc(lessonResources.position));

        lessonsWithResources.push({
          ...lesson,
          resources: resourceResults,
        });
      }

      modulesWithLessons.push({
        ...module,
        lessons: lessonsWithResources,
      });
    }

    // =======================================================
    // RESPONSE
    // =======================================================

    return NextResponse.json(
      {
        message: "Course fetched successfully",

        data: {
          course: {
            ...course,
            category,
            tags: courseTagResults,
          },

          modules: modulesWithLessons,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get course for edit error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch course",
      },
      { status: 500 },
    );
  }
}

/* =========================================================
   PATCH COURSE
========================================================= */

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    // =======================================================
    // 1. AUTHENTICATION
    // =======================================================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // =======================================================
    // 2. ROLE CHECK
    // =======================================================

    if (user.role !== "instructor") {
      return NextResponse.json(
        {
          message:
            "Only instructors can edit courses",
        },
        { status: 403 },
      );
    }

    // =======================================================
    // 3. COURSE ID
    // =======================================================

    const { courseId } = await params;

    const id = Number(courseId);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          message: "Invalid course ID",
        },
        { status: 400 },
      );
    }

    // =======================================================
    // 4. FIND COURSE + VERIFY OWNERSHIP
    // =======================================================

    const courseResult = await db
      .select({
        id: courses.id,
        instructorId: courses.instructorId,
        thumbnail: courses.thumbnail,
        status: courses.status,
      })
      .from(courses)
      .where(
        and(
          eq(courses.id, id),
          eq(
            courses.instructorId,
            user.id,
          ),
        ),
      )
      .limit(1);

    if (courseResult.length === 0) {
      return NextResponse.json(
        {
          message:
            "Course not found or you do not have permission to edit it",
        },
        { status: 404 },
      );
    }

    const existingCourse = courseResult[0];

    // =======================================================
    // 5. READ REQUEST BODY
    // =======================================================

    /*
     * PATCH now expects multipart/form-data.
     *
     * Fields:
     *
     * course     -> JSON string
     * modules    -> JSON string
     * thumbnail  -> actual File (optional)
     */

    const formData = await request.formData();

    const courseString = formData.get("course");
    const modulesString = formData.get("modules");
    const thumbnailFile = formData.get("thumbnail");

    let courseData:
      | CourseBuilderDraft["course"]
      | undefined;

    let moduleData:
      | CourseBuilderModule[]
      | undefined;

    try {
      if (courseString) {
        courseData = JSON.parse(
          String(courseString),
        ) as CourseBuilderDraft["course"];
      }

      if (modulesString) {
        moduleData = JSON.parse(
          String(modulesString),
        ) as CourseBuilderModule[];
      }
    } catch (error) {
      console.error(
        "Failed to parse course/modules JSON:",
        error,
      );

      return NextResponse.json(
        {
          message:
            "Invalid course or modules data",
          reason:
            error instanceof Error
              ? error.message
              : "Invalid JSON",
        },
        { status: 400 },
      );
    }

    if (!courseData) {
      return NextResponse.json(
        {
          message:
            "Course data is required",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(moduleData)) {
      return NextResponse.json(
        {
          message:
            "Modules must be an array",
        },
        { status: 400 },
      );
    }

    // =======================================================
    // 6. VALIDATE COURSE
    // =======================================================

    if (!courseData.title?.trim()) {
      return NextResponse.json(
        {
          message:
            "Course title is required",
        },
        { status: 400 },
      );
    }

    if (
      !courseData.description?.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Course description is required",
        },
        { status: 400 },
      );
    }

    if (!courseData.category) {
      return NextResponse.json(
        {
          message:
            "Course category is required",
        },
        { status: 400 },
      );
    }

    // =======================================================
    // 7. HANDLE THUMBNAIL
    // =======================================================

    /*
     * If the user uploads a new thumbnail:
     *
     * /public/uploads/courses/
     *
     * will contain the actual file.
     *
     * If no new thumbnail is uploaded,
     * keep the existing database thumbnail.
     */

    let thumbnailData =
      existingCourse.thumbnail;

    if (
      thumbnailFile instanceof File &&
      thumbnailFile.size > 0
    ) {
      const path = await import("path");
      const crypto = await import("crypto");
      const fs = await import("fs/promises");

      const uploadDirectory =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "courses",
        );

      // Make sure the directory exists
      await fs.mkdir(
        uploadDirectory,
        {
          recursive: true,
        },
      );

      // Get extension from original file
      const extension =
        path.extname(
          thumbnailFile.name,
        );

      // Generate unique filename
      const filename =
        `${crypto.randomUUID()}${extension}`;

      const filePath =
        path.join(
          uploadDirectory,
          filename,
        );

      // Convert File -> Buffer
      const bytes =
        await thumbnailFile.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      // Save file
      await fs.writeFile(
        filePath,
        buffer,
      );

      // Store this information in DB
      thumbnailData = {
        url:
          `/uploads/courses/${filename}`,
        fileName:
          thumbnailFile.name,
        fileSize:
          thumbnailFile.size,
        mimeType:
          thumbnailFile.type,
      };
    }

    // =======================================================
    // 8. UPDATE EVERYTHING IN TRANSACTION
    // =======================================================

    const result =
      await db.transaction(
        async (tx) => {

          // =================================================
          // UPDATE COURSE
          // =================================================

          await tx
            .update(courses)
            .set({
              title:
                courseData.title.trim(),

              description:
                courseData.description.trim(),

              categoryId:
                courseData.category
                  ?.id ?? null,

              price:
                Number(courseData.price) ||
                0,

              level:
                courseData.level,

              /*
               * Use thumbnailData instead of
               * courseData.thumbnail.
               */
              thumbnail:
                thumbnailData,

              updatedAt:
                new Date(),
            })
            .where(
              and(
                eq(courses.id, id),
                eq(
                  courses.instructorId,
                  user.id,
                ),
              ),
            );

          // =================================================
          // TAGS
          // =================================================

          await tx
            .delete(courseTags)
            .where(
              eq(
                courseTags.courseId,
                id,
              ),
            );

          if (
            courseData.tags &&
            courseData.tags.length > 0
          ) {
            for (
              const tag of courseData.tags
            ) {

              let tagId =
                Number(tag.id);

              /*
               * Check whether the tag already
               * exists.
               */

              const existingTag =
                await tx
                  .select({
                    id: tags.id,
                  })
                  .from(tags)
                  .where(
                    eq(
                      tags.name,
                      tag.name.trim(),
                    ),
                  )
                  .limit(1);

              if (
                existingTag.length > 0
              ) {
                tagId =
                  existingTag[0].id;
              } else {
                const insertedTag =
                  await tx
                    .insert(tags)
                    .values({
                      name:
                        tag.name.trim(),
                    });

                tagId =
                  Number(
                    insertedTag[0]
                      .insertId,
                  );
              }

              await tx
                .insert(courseTags)
                .values({
                  courseId: id,
                  tagId,
                });
            }
          }

          // =================================================
          // EXISTING MODULES
          // =================================================

          const existingModules =
            await tx
              .select({
                id: modules.id,
              })
              .from(modules)
              .where(
                eq(
                  modules.courseId,
                  id,
                ),
              );

          const existingModuleIds =
            existingModules.map(
              (module) =>
                module.id,
            );

          /*
           * IDs coming from the builder.
           *
           * Newly created modules use client-side IDs
           * such as Date.now(), so we only consider an
           * ID existing if it actually exists in the DB.
           */

          const submittedModuleIds =
            moduleData
              .map(
                (module) =>
                  Number(module.id),
              )
              .filter(
                (moduleId) =>
                  existingModuleIds.includes(
                    moduleId,
                  ),
              );

          // =================================================
          // DELETE REMOVED MODULES
          // =================================================

          const modulesToDelete =
            existingModuleIds.filter(
              (existingId) =>
                !submittedModuleIds.includes(
                  existingId,
                ),
            );

          /*
           * Delete children first because
           * modules contain lessons.
           */

          for (
            const moduleId of
              modulesToDelete
          ) {

            const moduleLessons =
              await tx
                .select({
                  id: lessons.id,
                })
                .from(lessons)
                .where(
                  eq(
                    lessons.moduleId,
                    moduleId,
                  ),
                );

            const lessonIds =
              moduleLessons.map(
                (lesson) =>
                  lesson.id,
              );

            if (
              lessonIds.length > 0
            ) {
              await tx
                .delete(
                  lessonResources,
                )
                .where(
                  inArray(
                    lessonResources.lessonId,
                    lessonIds,
                  ),
                );

              await tx
                .delete(lessons)
                .where(
                  inArray(
                    lessons.id,
                    lessonIds,
                  ),
                );
            }

            await tx
              .delete(modules)
              .where(
                and(
                  eq(
                    modules.id,
                    moduleId,
                  ),
                  eq(
                    modules.courseId,
                    id,
                  ),
                ),
              );
          }

          // =================================================
          // PROCESS MODULES
          // =================================================

          for (
            let moduleIndex = 0;
            moduleIndex <
            moduleData.length;
            moduleIndex++
          ) {

            const module =
              moduleData[
                moduleIndex
              ];

            let databaseModuleId:
              | number
              | null = null;

            const moduleExists =
              existingModuleIds.includes(
                Number(module.id),
              );

            // ===============================================
            // EXISTING MODULE
            // ===============================================

            if (moduleExists) {
              databaseModuleId =
                Number(module.id);

              await tx
                .update(modules)
                .set({
                  title:
                    module.title.trim(),

                  description:
                    module.description?.trim() ??
                    "",

                  position:
                    moduleIndex,

                  updatedAt:
                    new Date(),
                })
                .where(
                  and(
                    eq(
                      modules.id,
                      databaseModuleId,
                    ),
                    eq(
                      modules.courseId,
                      id,
                    ),
                  ),
                );
            }

            // ===============================================
            // NEW MODULE
            // ===============================================

            else {
              const insertedModule =
                await tx
                  .insert(modules)
                  .values({
                    courseId: id,

                    title:
                      module.title.trim(),

                    description:
                      module.description?.trim() ??
                      "",

                    position:
                      moduleIndex,

                    createdAt:
                      new Date(),

                    updatedAt:
                      new Date(),
                  });

              databaseModuleId =
                Number(
                  insertedModule[0]
                    .insertId,
                );
            }

            if (
              !databaseModuleId
            ) {
              continue;
            }

            // ===============================================
            // PROCESS LESSONS
            // ===============================================

            await processLessons(
              tx,
              databaseModuleId,
              module.lessons ?? [],
            );
          }

          return {
            id,
          };
        },
      );

    // =======================================================
    // RESPONSE
    // =======================================================

    return NextResponse.json(
      {
        message:
          "Course updated successfully",

        data: result,
      },
      { status: 200 },
    );

  } catch (error) {
    console.error(
      "Update course error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to update course",

        reason:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/* =========================================================
   PROCESS LESSONS
========================================================= */

async function processLessons(
  tx: any,
  moduleId: number,
  lessonData: CourseBuilderLesson[],
) {
  // =======================================================
  // EXISTING LESSONS
  // =======================================================

  const existingLessons = await tx
    .select({
      id: lessons.id,
    })
    .from(lessons)
    .where(eq(lessons.moduleId, moduleId));

  const existingLessonIds = existingLessons.map(
    (lesson: { id: number }) => lesson.id,
  );

  // =======================================================
  // SUBMITTED EXISTING LESSON IDs
  // =======================================================

  const submittedLessonIds = lessonData
    .map((lesson) => Number(lesson.id))
    .filter((lessonId) => existingLessonIds.includes(lessonId));

  // =======================================================
  // DELETE REMOVED LESSONS
  // =======================================================

  const lessonsToDelete = existingLessonIds.filter(
    (existingId: number) => !submittedLessonIds.includes(existingId),
  );

  for (const lessonId of lessonsToDelete) {
    await tx
      .delete(lessonResources)
      .where(eq(lessonResources.lessonId, lessonId));

    await tx
      .delete(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.moduleId, moduleId)));
  }

  // =======================================================
  // PROCESS LESSONS
  // =======================================================

  for (let lessonIndex = 0; lessonIndex < lessonData.length; lessonIndex++) {
    const lesson = lessonData[lessonIndex];

    let databaseLessonId: number | null = null;

    const lessonExists = existingLessonIds.includes(Number(lesson.id));

    // =====================================================
    // EXISTING LESSON
    // =====================================================

    if (lessonExists) {
      databaseLessonId = Number(lesson.id);

      await tx
        .update(lessons)
        .set({
          title: lesson.title.trim(),

          description: lesson.description?.trim() ?? "",

          content: lesson.content,

          position: lessonIndex,

          updatedAt: new Date(),
        })
        .where(
          and(eq(lessons.id, databaseLessonId), eq(lessons.moduleId, moduleId)),
        );
    }

    // =====================================================
    // NEW LESSON
    // =====================================================
    else {
      const insertedLesson = await tx.insert(lessons).values({
        moduleId,

        title: lesson.title.trim(),

        description: lesson.description?.trim() ?? "",

        content: lesson.content,

        position: lessonIndex,

        createdAt: new Date(),

        updatedAt: new Date(),
      });

      databaseLessonId = Number(insertedLesson[0].insertId);
    }

    if (!databaseLessonId) {
      continue;
    }

    // =====================================================
    // PROCESS RESOURCES
    // =====================================================

    await processResources(tx, databaseLessonId, lesson.resources ?? []);
  }
}

/* =========================================================
   PROCESS RESOURCES
========================================================= */

async function processResources(
  tx: any,
  lessonId: number,
  resourceData: LessonResource[],
) {
  // =======================================================
  // EXISTING RESOURCES
  // =======================================================

  const existingResources = await tx
    .select({
      id: lessonResources.id,
    })
    .from(lessonResources)
    .where(eq(lessonResources.lessonId, lessonId));

  const existingResourceIds = existingResources.map(
    (resource: { id: number }) => resource.id,
  );

  // =======================================================
  // SUBMITTED EXISTING RESOURCE IDs
  // =======================================================

  const submittedResourceIds = resourceData
    .map((resource) => Number(resource.id))
    .filter((resourceId) => existingResourceIds.includes(resourceId));

  // =======================================================
  // DELETE REMOVED RESOURCES
  // =======================================================

  const resourcesToDelete = existingResourceIds.filter(
    (existingId: number) => !submittedResourceIds.includes(existingId),
  );

  for (const resourceId of resourcesToDelete) {
    await tx
      .delete(lessonResources)
      .where(
        and(
          eq(lessonResources.id, resourceId),
          eq(lessonResources.lessonId, lessonId),
        ),
      );
  }

  // =======================================================
  // PROCESS RESOURCES
  // =======================================================

  for (
    let resourceIndex = 0;
    resourceIndex < resourceData.length;
    resourceIndex++
  ) {
    const resource = resourceData[resourceIndex];

    const resourceExists = existingResourceIds.includes(Number(resource.id));

    // =====================================================
    // EXISTING RESOURCE
    // =====================================================

    if (resourceExists) {
      await tx
        .update(lessonResources)
        .set({
          title: resource.title.trim(),

          metadata: resource.metadata,

          position: resourceIndex,

          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lessonResources.id, Number(resource.id)),
            eq(lessonResources.lessonId, lessonId),
          ),
        );
    }

    // =====================================================
    // NEW RESOURCE
    // =====================================================
    else {
      await tx.insert(lessonResources).values({
        lessonId,

        title: resource.title.trim(),

        metadata: resource.metadata,

        position: resourceIndex,

        createdAt: new Date(),

        updatedAt: new Date(),
      });
    }
  }
}
