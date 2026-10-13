import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookmarks, courses, categories, users, lessons, modules } from "@/db/schema";
import { eq, and, desc, isNotNull, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let bookmarkRows;

    if (type === "lessons") {
      bookmarkRows = await db
        .select({
          id: bookmarks.id,
          userId: bookmarks.userId,
          courseId: bookmarks.courseId,
          lessonId: bookmarks.lessonId,
          createdAt: bookmarks.createdAt,
          courseTitle: courses.title,
          lessonName: lessons.title,
          moduleName: modules.title,
        })
        .from(bookmarks)
        .leftJoin(courses, eq(bookmarks.courseId, courses.id))
        .leftJoin(lessons, eq(bookmarks.lessonId, lessons.id))
        .leftJoin(modules, eq(lessons.moduleId, modules.id))
        .where(
          and(
            eq(bookmarks.userId, userId),
            isNotNull(bookmarks.lessonId),
            sql`${bookmarks.lessonId} <> 0`
          )
        )
        .orderBy(desc(bookmarks.createdAt));
    } else {
      bookmarkRows = await db
        .select({
          id: bookmarks.id,
          userId: bookmarks.userId,
          courseId: bookmarks.courseId,
          lessonId: bookmarks.lessonId,
          createdAt: bookmarks.createdAt,
          title: courses.title,
          description: courses.description,
          thumbnail: courses.thumbnail,
          category: categories.name,
          level: courses.level,
          price: courses.price,
          status: courses.status,
        instructorName: users.username,
      })
        .from(bookmarks)
        .innerJoin(courses, eq(bookmarks.courseId, courses.id))
        .leftJoin(categories, eq(courses.categoryId, categories.id))
        .leftJoin(users, eq(courses.instructorId, users.id))
        .where(eq(bookmarks.userId, userId))
        .orderBy(desc(bookmarks.createdAt));
    }

    return NextResponse.json({
      data: bookmarkRows,
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return NextResponse.json(
      { message: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();
    const { courseId, lessonId } = body;

    if (!courseId && !lessonId) {
      return NextResponse.json(
        { message: "Either courseId or lessonId is required" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          lessonId
            ? eq(bookmarks.lessonId, lessonId)
            : eq(bookmarks.courseId, courseId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(bookmarks)
        .where(eq(bookmarks.id, existing[0].id));
      return NextResponse.json({
        message: "Bookmark removed",
        bookmarked: false,
      });
    }

    const newBookmark = await db
      .insert(bookmarks)
      .values({
        userId,
        courseId: courseId ?? null,
        lessonId: lessonId ?? null,
        createdAt: new Date(),
      });

    return NextResponse.json(
      {
        message: "Bookmark added",
        bookmarked: true,
        data: newBookmark,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    return NextResponse.json(
      { message: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get("id");
    const courseId = searchParams.get("courseId");

    if (bookmarkId) {
      await db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.id, Number(bookmarkId)),
            eq(bookmarks.userId, userId)
          )
        );
    } else if (courseId) {
      await db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.courseId, Number(courseId))
          )
        );
    } else {
      return NextResponse.json(
        { message: "Bookmark ID or Course ID is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Bookmark removed",
      bookmarked: false,
    });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return NextResponse.json(
      { message: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}
