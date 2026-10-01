"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CourseThumbnail =
  | string
  | {
      url: string;
      fileSize: number;
      mimeType: string;
      fileName: string;
    }
  | null;

type Course = {
  id: number;
  uuid?: string;
  title: string;
  description: string | null;
  thumbnail: CourseThumbnail;
  price: number | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  status: "draft" | "published" | null;
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  isDraft?: boolean; // Flag to identify draft courses from course_builder_draft
  // Draft-specific fields
  draftStatus?: string;
  currentStep?: number;
  completionPct?: number;
  version?: number;
  lastActivityAt?: string;
  sourceCourseId?: number | null;
};

export function useCourses() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get courses created by the logged-in instructor
  const getCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/instructor/courses");

      const data = await response.json();

      if (response.status === 401) {
        router.push("/signin");
        return;
      }

      if (response.status === 403) {
        setError(
          data.message || "You are not allowed to access these courses",
        );
        return;
      }

      if (!response.ok) {
        setError(data.message || "Failed to load courses");
        return;
      }

      setCourses(data.data);
    } catch (error) {
      console.error("Get instructor courses error:", error);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Create course
  async function createCourse(formData: FormData) {
    setError("");

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        setError(data.message || "Unauthorized");
        router.push("/signin");
        return false;
      }

      if (response.status === 403) {
        setError(
          data.message || "You are not allowed to create courses",
        );
        return false;
      }

      if (response.status === 400) {
        setError(data.message || "Invalid course data");
        return false;
      }

      if (!response.ok) {
        setError(data.message || "Failed to create course");
        return false;
      }

      // Refresh instructor's courses
      await getCourses();

      return true;
    } catch (error) {
      console.error("Create course error:", error);
      setError("Unable to connect to the server");
      return false;
    }
  }

  // Load instructor courses when the hook is mounted
  useEffect(() => {
    getCourses();
  }, [getCourses]);

  return {
    courses,
    loading,
    error,
    getCourses,
    refetch: getCourses,
    createCourse,
  };
}