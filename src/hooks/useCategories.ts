"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/courses?type=categories")
      .then(async (response) => {
        const data = (await response.json()) as {
          data?: Category[];
          message?: string;
        };

        if (!response.ok) {
          if (active) {
            setError(data.message ?? "Failed to load categories");
          }
          return null;
        }

        return data;
      })
      .then((data) => {
        if (active) {
          setCategories(data?.data ?? []);
          setError("");
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load categories");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    categories,
    loading,
    error,
  };
}
