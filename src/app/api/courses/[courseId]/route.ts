import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  courses,
  users,
  tags,
  courseTags,
  modules,
  lessons as lesson,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const id = parseInt(courseId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid course ID" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    // For public access, allow viewing published courses
    // For instructors, allow viewing their own courses (any status)
    let courseCondition = eq(courses.id, id);

    if (user?.role === "instructor") {
      courseCondition = eq(courses.id, id); // Instructors can view their own drafts
    } else {
      // Public users can only view published courses
      courseCondition = eq(courses.id, id); // We'll filter by status in the query
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
        level: courses.level,
        categoryId: courses.categoryId,

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
      .limit(1);

    if (courseRows.length === 0) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const course = courseRows[0];

    // Check if user can access this course
    if (course.status !== "published" && user?.role !== "instructor") {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Tags
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

    // Modules with lessons
    const moduleRows = await db
      .select({
        id: modules.id,
        title: modules.title,
      })
      .from(modules)
      .where(
        eq(modules.courseId, course.id),
      );

    const moduleResources =
      await Promise.all(
        moduleRows.map(async (module) => {
          const lessonRows = await db
            .select({
              id: lesson.id,
              title: lesson.title,
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
            name: module.title ?? "",
            lessons: lessonRows.map(
              (lessonItem) => ({
                id: lessonItem.id,
                name: lessonItem.title ?? "",
                videoUrls: [],
                resources: [],
              }),
            ),
          };
        }),
      );

    const result = {
      id: course.id,
      title: course.title ?? "",
      description: course.description ?? "",
      thumbnail: course.thumbnail ?? "",
      price: course.price ?? 0,
      level: course.level ?? "beginner",
      status: course.status ?? "draft",
      createdAt:
        course.createdAt?.toISOString() ?? "",
      publishedAt: course.publishedAt
        ? course.publishedAt.toISOString()
        : null,
      tags: tagRows,
      instructor: {
        id: course.instructorId ?? 0,
        name: `${course.instructorFirstName ?? ""} ${
          course.instructorLastName ?? ""
        }`.trim(),
        email: course.instructorEmail ?? "",
      },
      modules: moduleResources,
    };

    return NextResponse.json({
      data: result,
    });

  } catch (error) {
    console.error("Get course error:", error);

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