import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  asc,
  desc,
  eq,
} from "drizzle-orm";

import { db } from "@/db";
import {
  courses,
  users,
  tags,
  courseTags,
  modules,
  lessons as lesson,
  categories,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { courseSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");

    // --------------------------------
    // Get categories
    // --------------------------------

    if (type === "categories") {
      const result = await db
        .select({
          id: categories.id,
          name: categories.name,
        })
        .from(categories)
        .orderBy(asc(categories.name));

      return NextResponse.json({
        data: result,
      });
    }

    // --------------------------------
    // Get courses
    // --------------------------------

    const user = await getCurrentUser();

    let courseCondition;

    if (user?.role === "instructor") {
      courseCondition = eq(
        courses.instructorId,
        user.id,
      );
    } else {
      courseCondition = eq(
        courses.status,
        "published",
      );
    }

    const courseRows = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        thumbnail: courses.thumbnail,
        price: courses.price,
        createdAt: courses.createdAt,
        status: courses.status,
        publishedAt: courses.publishedAt,

        instructorId: users.id,
        instructorFirstName: users.firstName,
        instructorLastName: users.lastName,
        instructorEmail: users.gmail,
      })
      .from(courses)
      .leftJoin(
        users,
        eq(courses.instructorId, users.id),
      )
      .where(courseCondition)
      .orderBy(desc(courses.createdAt));

    const result = await Promise.all(
      courseRows.map(async (course) => {

        // --------------------------------
        // Tags
        // --------------------------------

        const tagRows = await db
          .select({
            id: tags.id,
            name: tags.name,
          })
          .from(courseTags)
          .innerJoin(
            tags,
            eq(courseTags.tagId, tags.id),
          )
          .where(
            eq(courseTags.courseId, course.id),
          );

        // --------------------------------
        // Modules
        // --------------------------------

        const moduleRows = await db
          .select({
            id: modules.id,
            name: modules.title,
          })
          .from(modules)
          .where(
            eq(modules.courseId, course.id),
          );

        // --------------------------------
        // Lessons
        // --------------------------------

        const moduleResources =
          await Promise.all(
            moduleRows.map(async (module) => {

              const lessonRows = await db
                .select({
                  id: lesson.id,
                  name: lesson.title,
                })
                .from(lesson)
                .where(
                  eq(
                    lesson.moduleId,
                    module.id,
                  ),
                );

              return {
                id: module.id,
                name: module.name ?? "",
                lessons: lessonRows.map(
                  (lessonItem) => ({
                    id: lessonItem.id,
                    name: lessonItem.name ?? "",
                    videoUrls: [],
                    resources: [],
                  }),
                ),
              };
            }),
          );

        // --------------------------------
        // Course Resource
        // --------------------------------

        return {
          id: course.id,
          title: course.title ?? "",
          description: course.description ?? "",
          thumbnail: course.thumbnail ?? "",
          price: course.price ?? 0,

          createdAt:
            course.createdAt?.toISOString() ?? "",

          status:
            course.status ?? "draft",

          publishedAt: course.publishedAt
            ? course.publishedAt.toISOString()
            : null,

          tags: tagRows, 

          instructor: {
            id: course.instructorId ?? 0,

            name: `${course.instructorFirstName ?? ""} ${
              course.instructorLastName ?? ""
            }`.trim(),

            email:
              course.instructorEmail ?? "",
          },

          modules: moduleResources,
        };
      }),
    );

    return NextResponse.json({
      data: result,
    });

  } catch (error) {
    console.error(
      "Get courses error:",
      error,
    );

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    // --------------------------------
    // 1. Check authentication
    // --------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // --------------------------------
    // 2. Check instructor
    // --------------------------------

    if (user.role !== "instructor") {
      return NextResponse.json(
        {
          message: "Only instructors can create courses",
        },
        { status: 403 }
      );
    }

    // --------------------------------
    // 3. Get FormData
    // --------------------------------

    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const categoryId = formData.get("categoryId");
    const price = formData.get("price");
    const level = formData.get("level");
    const thumbnail = formData.get("thumbnail");

    // --------------------------------
    // 4. Validate normal fields
    // --------------------------------

    const result = courseSchema.safeParse({
      title,
      description,
      categoryId: Number(categoryId),
      price: Number(price),
      level,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 5. Validate thumbnail
    // --------------------------------

    if (!(thumbnail instanceof File)) {
      return NextResponse.json(
        {
          message: "Course thumbnail is required",
        },
        { status: 400 }
      );
    }

    if (!thumbnail.type.startsWith("image/")) {
      return NextResponse.json(
        {
          message: "Thumbnail must be an image",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 6. Generate unique file name
    // --------------------------------

    const extension =
      thumbnail.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${randomUUID()}.${extension}`;

    // --------------------------------
    // 7. Create upload directory
    // --------------------------------

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "courses"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    // --------------------------------
    // 8. Save file
    // --------------------------------

    const filePath = path.join(
      uploadDirectory,
      fileName
    );

    const bytes = await thumbnail.arrayBuffer();

    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // --------------------------------
    // 9. Generate working URL
    // --------------------------------

    const origin = new URL(request.url).origin;

    const thumbnailUrl =
      `${origin}/uploads/courses/${fileName}`;

    // --------------------------------
    // 10. Create thumbnail JSON object
    // --------------------------------

    const thumbnailData = {
      url: thumbnailUrl,
      fileName: thumbnail.name,
      fileSize: thumbnail.size,
      mimeType: thumbnail.type,
    };

    // --------------------------------
    // 11. Create course
    // --------------------------------

    const [course] = await db
      .insert(courses)
      .values({
        title: result.data.title,
        description: result.data.description,
        categoryId: result.data.categoryId,
        price: result.data.price,
        level: result.data.level,

        // Store JSON object
        thumbnail: thumbnailData,

        status: "draft",
        instructorId: user.id,
        createdAt: new Date(),
      })
      .$returningId();

    // --------------------------------
    // 12. Response
    // --------------------------------

    return NextResponse.json(
      {
        message: "Course created successfully",

        course: {
          id: course.id,
          thumbnail: thumbnailData,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create course error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}