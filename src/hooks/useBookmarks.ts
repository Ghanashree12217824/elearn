"use client";

import { useState, useEffect } from "react";

export type BookmarkedCourse = {
  id: number;
  userId: number;
  courseId: number | null;
  lessonId: number | null;
  createdAt: string;
  title: string | null;
  description: string | null;
  thumbnail: { url?: string; fileName?: string; fileSize?: number; mimeType?: string } | string | null;
  category: string | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  price: number | null;
  status: "draft" | "published" | null;
  instructorName: string | null;
};

export type BookmarkedLesson = {
  id: number;
  userId: number;
  courseId: number | null;
  lessonId: number | null;
  createdAt: string;
  courseTitle: string | null;
  lessonName: string | null;
  moduleName: string | null;
};

export type BookmarkCollectionResource = {
  data: (BookmarkedCourse | BookmarkedLesson)[];
};

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedCourse[]>([]);
  const [bookmarkedLessonIds, setBookmarkedLessonIds] = useState<Set<number>>(new Set());
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchBookmarks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/bookmarks", {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to load bookmarks");
        return;
      }

      const data: BookmarkCollectionResource = await response.json();
      const bookmarkedCourses = data.data.filter(
        (b): b is BookmarkedCourse => b.courseId !== null
      ) as BookmarkedCourse[];
      setBookmarks(bookmarkedCourses);

      const courseIds = new Set<number>();
      const lessonIds = new Set<number>();
      data.data.forEach((b) => {
        if (b.courseId !== null) {
          courseIds.add(b.courseId);
        }
        if (b.lessonId !== null) {
          lessonIds.add(b.lessonId);
        }
      });
      setBookmarkedCourseIds(courseIds);
      setBookmarkedLessonIds(lessonIds);
    } catch (err) {
      console.error("Fetch bookmarks error:", err);
      setError("Unable to load bookmarks");
    } finally {
      setLoading(false);
    }
  }

  async function toggleBookmark(courseId: number, lessonId?: number) {
    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          lessonId
            ? { lessonId }
            : { courseId }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message };
      }

      if (lessonId) {
        if (data.bookmarked) {
          setBookmarkedLessonIds((prev) => new Set(prev).add(lessonId));
        } else {
          setBookmarkedLessonIds((prev) => {
            const next = new Set(prev);
            next.delete(lessonId);
            return next;
          });
        }
      } else {
        if (data.bookmarked) {
          setBookmarkedCourseIds((prev) => new Set(prev).add(courseId));
        } else {
          setBookmarkedCourseIds((prev) => {
            const next = new Set(prev);
            next.delete(courseId);
            return next;
          });
        }
      }

      await fetchBookmarks();
      return { success: true, bookmarked: data.bookmarked };
    } catch (err) {
      console.error("Toggle bookmark error:", err);
      return { success: false, message: "Something went wrong" };
    }
  }

  async function removeBookmark(bookmarkId: number) {
    try {
      const response = await fetch(
        `/api/bookmarks?id=${bookmarkId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message };
      }

      await fetchBookmarks();
      return { success: true };
    } catch (err) {
      console.error("Remove bookmark error:", err);
      return { success: false, message: "Something went wrong" };
    }
  }

  function isBookmarked(courseId?: number, lessonId?: number) {
    if (lessonId) {
      return bookmarkedLessonIds.has(lessonId);
    }
    if (courseId) {
      return bookmarkedCourseIds.has(courseId);
    }
    return false;
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookmarks();
  }, []);

  return {
    bookmarks,
    loading,
    error,
    refetch: fetchBookmarks,
    toggleBookmark,
    removeBookmark,
    isBookmarked,
    bookmarkedCourseIds,
    bookmarkedLessonIds,
  };
}
