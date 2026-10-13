"use client";

import { useState, useEffect } from "react";

export type ProgressRecord = {
  id: number;
  userId: number;
  courseId: number;
  lessonId: number;
  completed: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lessonTitle: string | null;
  moduleTitle: string | null;
  courseTitle: string | null;
};

export type ProgressCollectionResource = {
  data: ProgressRecord[];
};

export type CourseProgress = {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
};

export function useProgress() {
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProgress(courseId?: number) {
    try {
      setLoading(true);
      setError("");

      const url = new URL("/api/progress", window.location.origin);
      if (courseId) {
        url.searchParams.set("courseId", courseId.toString());
      }

      const response = await fetch(url.toString(), {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to load progress");
        return;
      }

      const data: ProgressCollectionResource = await response.json();
      setProgressRecords(data.data || []);
    } catch (err) {
      console.error("Fetch progress error:", err);
      setError("Unable to load progress");
    } finally {
      setLoading(false);
    }
  }

  async function markLessonComplete(courseId: number, lessonId: number, completed: boolean = true) {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId, completed }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message };
      }

      setProgressRecords((prev) => {
        const existingIndex = prev.findIndex(
          (r) => r.lessonId === lessonId && r.courseId === courseId
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data.data;
          return updated;
        }

        return [data.data, ...prev];
      });

      return { success: true };
    } catch (err) {
      console.error("Mark lesson complete error:", err);
      return { success: false, message: "Something went wrong" };
    }
  }

  function getCourseProgress(courseId: number, totalLessons: number): CourseProgress {
    const completed = progressRecords.filter(
      (r) => r.courseId === courseId && r.completed === 1
    ).length;

    const percent = totalLessons > 0
      ? Math.round((completed / totalLessons) * 100)
      : 0;

    return {
      courseId,
      totalLessons,
      completedLessons: completed,
      progressPercent: percent,
    };
  }

  function getLessonCompleted(lessonId: number) {
    return progressRecords.some(
      (r) => r.lessonId === lessonId && r.completed === 1
    );
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProgress();
  }, []);

  return {
    progressRecords,
    loading,
    error,
    refetch: fetchProgress,
    markLessonComplete,
    getCourseProgress,
    getLessonCompleted,
  };
}
