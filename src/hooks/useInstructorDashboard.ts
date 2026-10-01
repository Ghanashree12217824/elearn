"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardData = {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  students: number;
};

export function useInstructorDashboard() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData>({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    students: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/instructor/dashboard");

      const data = await response.json();

      if (response.status === 401) {
        router.push("/signin");
        return;
      }

      if (response.status === 403) {
        setError(
          data.message || "You are not allowed to access the dashboard",
        );
        return;
      }

      if (!response.ok) {
        setError(data.message || "Failed to load dashboard");
        return;
      }

      setDashboard(data.data);
    } catch (error) {
      console.error("Get instructor dashboard error:", error);
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    getDashboard();
  }, [getDashboard]);

  return {
    dashboard,
    loading,
    error,
    getDashboard,
  };
}