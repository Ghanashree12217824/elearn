"use client";

import { useState, useEffect } from "react";
import type { CourseThumbnail } from "@/types/course";

export type EnrolledCourse = {
  id: number;
  title: string;
  description: string | null;
  thumbnail: CourseThumbnail | string | null;
  category: string | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  price: number | null;
  status: "draft" | "published";
  instructorId: number | null;
  instructorName: string | null;
  enrolledAt: string;
  enrollmentStatus: "active" | "completed" | "cancelled";
  totalLessons: number | null;
};

export type EnrollmentCollectionResource = {
  data: EnrolledCourse[];
};

export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchEnrollments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/enrollments", {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to load enrollments");
        return;
      }

      const data: EnrollmentCollectionResource = await response.json();
      setEnrollments(data.data || []);
    } catch (err) {
      console.error("Fetch enrollments error:", err);
      setError("Unable to load enrollments");
    } finally {
      setLoading(false);
    }
  }

  async function enroll(courseId: number) {
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message };
      }

      await fetchEnrollments();
      return { success: true };
    } catch (err) {
      console.error("Enroll error:", err);
      return { success: false, message: "Something went wrong" };
    }
  }

  async function unenroll(courseId: number) {
    try {
      const response = await fetch(
        `/api/enrollments?courseId=${courseId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message };
      }

      await fetchEnrollments();
      return { success: true };
    } catch (err) {
      console.error("Unenroll error:", err);
      return { success: false, message: "Something went wrong" };
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEnrollments();
  }, []);

  return {
    enrollments,
    loading,
    error,
    refetch: fetchEnrollments,
    enroll,
    unenroll,
  };
}