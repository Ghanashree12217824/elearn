"use client";

import { useState } from "react";

export type Module = {
  id: number;
  title: string;
  description: string | null;
  courseId: number;
};

export function useModules(
  courseId: number,
) {
  const [modules, setModules] =
    useState<Module[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // --------------------------------
  // Get modules
  // --------------------------------

  async function getModules() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/courses/${courseId}/modules`,
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to load modules",
        );

        return;
      }

      setModules(data.data ?? []);
    } catch (error) {
      console.error(
        "Get modules error:",
        error,
      );

      setError(
        "Unable to load modules",
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------
  // Create module
  // --------------------------------

  async function createModule(
    title: string,
    description: string,
  ) {
    try {
      setError("");

      const response = await fetch(
        `/api/courses/${courseId}/modules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create module",
        );

        return false;
      }

      await getModules();

      return true;
    } catch (error) {
      console.error(
        "Create module error:",
        error,
      );

      setError(
        "Unable to create module",
      );

      return false;
    }
  }

  return {
    modules,
    loading,
    error,
    getModules,
    createModule,
  };
}