"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type CourseEnrollment = {
  courseId: number;
  title: string;
  price: number | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  status: "draft" | "published";
  enrollmentCount: number;
};

type PosData = {
  uniqueStudents: number;
  totalEnrollments: number;
  courseEnrollments: CourseEnrollment[];
};

export function usePosAnalytics() {
  const router = useRouter();

  const [posData, setPosData] = useState<PosData>({
    uniqueStudents: 0,
    totalEnrollments: 0,
    courseEnrollments: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/instructor/pos");

      const data = await response.json();

      if (response.status === 401) {
        router.push("/signin");
        return;
      }

      if (response.status === 403) {
        setError(
          data.message || "You are not allowed to access POS analytics",
        );
        return;
      }

      if (!response.ok) {
        setError(data.message || "Failed to load POS analytics");
        return;
      }

      setPosData(data.data);
    } catch (error) {
      console.error("Get POS analytics error:", error);
      setError("Failed to load POS analytics");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPosData();
  }, [fetchPosData]);

  return {
    posData,
    loading,
    error,
    refetch: fetchPosData,
  };
}