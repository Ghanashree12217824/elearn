import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { courses, modules } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const moduleSchema = z.object({
  title: z
    .string()
    .min(2, "Module title must be at least 2 characters")
    .max(45, "Module title cannot exceed 45 characters"),

  description: z
    .string()
    .max(45, "Module description cannot exceed 45 characters")
    .optional()
    .or(z.literal("")),
});

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

/*
|--------------------------------------------------------------------------
| GET MODULES
|--------------------------------------------------------------------------
|
| GET /api/courses/[courseId]/modules
|
| Returns all modules belonging to a course.
|
*/

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    // --------------------------------
    // 1. Check authentication
    // --------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // --------------------------------
    // 2. Get course ID
    // --------------------------------

    const { courseId } = await context.params;

    const parsedCourseId = Number(courseId);

    if (
      !Number.isInteger(parsedCourseId) ||
      parsedCourseId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid course ID",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------
    // 3. Find course
    // --------------------------------

    const course = await db
      .select({
        id: courses.id,
        instructorId: courses.instructorId,
      })
      .from(courses)
      .where(eq(courses.id, parsedCourseId))
      .limit(1);

    if (course.length === 0) {
      return NextResponse.json(
        {
          message: "Course not found",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------
    // 4. Check course ownership
    // --------------------------------

    if (
      user.role === "instructor" &&
      course[0].instructorId !== user.id
    ) {
      return NextResponse.json(
        {
          message:
            "You are not allowed to access this course",
        },
        {
          status: 403,
        },
      );
    }

    // --------------------------------
    // 5. Get modules
    // --------------------------------

    const result = await db
      .select({
        id: modules.id,
        title: modules.title,
        description: modules.description,
        courseId: modules.courseId,
      })
      .from(modules)
      .where(eq(modules.courseId, parsedCourseId))
      .orderBy(asc(modules.id));

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error("Get modules error:", error);

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

/*
|--------------------------------------------------------------------------
| CREATE MODULE
|--------------------------------------------------------------------------
|
| POST /api/courses/[courseId]/modules
|
*/

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    // --------------------------------
    // 1. Check authentication
    // --------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // --------------------------------
    // 2. Check instructor
    // --------------------------------

    if (user.role !== "instructor") {
      return NextResponse.json(
        {
          message:
            "Only instructors can manage modules",
        },
        {
          status: 403,
        },
      );
    }

    // --------------------------------
    // 3. Get course ID
    // --------------------------------

    const { courseId } = await context.params;

    const parsedCourseId = Number(courseId);

    if (
      !Number.isInteger(parsedCourseId) ||
      parsedCourseId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid course ID",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------
    // 4. Check course ownership
    // --------------------------------

    const course = await db
      .select({
        id: courses.id,
        instructorId: courses.instructorId,
      })
      .from(courses)
      .where(eq(courses.id, parsedCourseId))
      .limit(1);

    if (course.length === 0) {
      return NextResponse.json(
        {
          message: "Course not found",
        },
        {
          status: 404,
        },
      );
    }

    if (
      course[0].instructorId !== user.id
    ) {
      return NextResponse.json(
        {
          message:
            "You are not allowed to modify this course",
        },
        {
          status: 403,
        },
      );
    }

    // --------------------------------
    // 5. Get request body
    // --------------------------------

    const body = await request.json();

    // --------------------------------
    // 6. Validate
    // --------------------------------

    const result =
      moduleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------
    // 7. Create module
    // --------------------------------

    const [module] = await db
      .insert(modules)
      .values({
        title: result.data.title,
        description:
          result.data.description || null,
        courseId: parsedCourseId,
        createdAt: new Date(),
      })
      .$returningId();

    // --------------------------------
    // 8. Response
    // --------------------------------

    return NextResponse.json(
      {
        message: "Module created successfully",

        module: {
          id: module.id,
          title: result.data.title,
          description:
            result.data.description || null,
          courseId: parsedCourseId,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Create module error:",
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