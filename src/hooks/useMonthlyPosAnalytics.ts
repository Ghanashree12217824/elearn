"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type MonthlyAnalyticsData = {
  label: string;
  month: number;
  year: number;
  enrollments: number;
  revenue: number;
};

export function useMonthlyPosAnalytics() {
  const router = useRouter();

  const [data, setData] = useState<MonthlyAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMonthlyData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/instructor/pos/monthly");

      const result = await response.json();

      if (response.status === 401) {
        router.push("/signin");
        return;
      }

      if (response.status === 403) {
        setError(
          result.message || "You are not allowed to access monthly analytics",
        );
        return;
      }

      if (!response.ok) {
        setError(result.message || "Failed to load monthly analytics");
        return;
      }

      setData(result.data);
    } catch (error) {
      console.error("Get monthly POS analytics error:", error);
      setError("Failed to load monthly analytics");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  return {
    data,
    loading,
    error,
    refetch: fetchMonthlyData,
  };
}