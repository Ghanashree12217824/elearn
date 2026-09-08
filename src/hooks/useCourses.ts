"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Course = {
  id: number;
  title: string;
  description: string;
  instructorId: number;
  createdAt: string;
};

export function useCourses() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function getCourses() {
    try {
      const response = await fetch("/api/courses");

      const data = await response.json();

      if (response.status === 401) {
        router.push("/signin");
        return;
      }

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setCourses(data);
    } catch {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function createCourse(title: string, description: string) {
    setError("");

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setError(data.message || "Unauthorized");
        return false;
      }

      if (response.status === 403) {
        setError(data.message || "You are not allowed to create courses");
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

      await getCourses();

      return true;
    } catch (error) {
      console.error("Create course error:", error);

      setError("Unable to connect to the server");
      return false;
    }
  }

  useEffect(() => {
    getCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    createCourse,
  };
}
