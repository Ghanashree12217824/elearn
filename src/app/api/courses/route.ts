import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { db } from "@/db";
import { courses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { courseSchema } from "@/lib/validation";


export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const result = await db
      .select()
      .from(courses)
      .orderBy(desc(courses.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Get authenticated user
    const user = await getCurrentUser();

    // 2. Check authentication
    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // 3. Check authorization
    if (user.role !== "instructor") {
      return NextResponse.json(
        {
          message:
            "Only instructors can create courses",
        },
        {
          status: 403,
        }
      );
    }

    // 4. Get request body
    const body = await request.json();

    // 5. Validate request body
    const result = courseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const {
      title,
      description,
    } = result.data;

    // 6. Create course
    await db.insert(courses).values({
      title,
      description,

      // IMPORTANT:
      // instructorId comes from authenticated user
      instructorId: user.id,
    });

    return NextResponse.json(
      {
        message: "Course created successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Something went wrong",
        status: 500,
        error: error
      }
    );
  }
}