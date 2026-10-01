"use client";

import { useEffect, useState } from "react";

import SignInForm from "@/components/SignInForm";
import CourseCard from "@/components/CourseCard";

import type {
  CourseCollectionResource,
  CourseResource,
} from "@/types/course";

export default function SignInPage() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const [courses, setCourses] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------
  // Get courses from database
  // --------------------------------

  useEffect(() => {
    async function getCourses() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/courses");

        const data: CourseCollectionResource = await response.json();

        if (!response.ok) {
          setError("Failed to load courses");
          return;
        }

        setCourses(data.data);
      } catch (error) {
        console.error("Get courses error:", error);
        setError("Unable to load courses");
      } finally {
        setLoading(false);
      }
    }

    getCourses();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* -------------------------------- */}
      {/* Navbar */}
      {/* -------------------------------- */}

      <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

        <h1 className="text-xl font-bold text-slate-900">
          LearnHub
        </h1>

        <button
          type="button"
          onClick={() => setIsSignInOpen(true)}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-indigo-700"
        >
          Sign In
        </button>

      </nav>

      {/* -------------------------------- */}
      {/* Hero */}
      {/* -------------------------------- */}

      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="max-w-2xl">

          <p className="text-sm font-semibold text-indigo-600">
            LEARN. BUILD. GROW.
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Learn skills that move you forward.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-500">
            Explore courses created by experienced
            instructors and build practical skills at
            your own pace.
          </p>

        </div>

      </section>

      {/* -------------------------------- */}
      {/* Courses */}
      {/* -------------------------------- */}

      <section className="mx-auto max-w-7xl px-6 pb-16">

        {/* Section Header */}

        <div className="mb-8 flex items-end justify-between">

          <div>

            <p className="text-sm font-semibold text-indigo-600">
              EXPLORE
            </p>

            <h3 className="mt-1 text-2xl font-bold text-slate-900">
              Popular Courses
            </h3>

          </div>

          <button
            type="button"
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            View all →
          </button>

        </div>

        {/* -------------------------------- */}
        {/* Loading */}
        {/* -------------------------------- */}

        {loading && (
          <div className="py-12 text-center">

            <p className="text-sm text-slate-500">
              Loading courses...
            </p>

          </div>
        )}

        {/* -------------------------------- */}
        {/* Error */}
        {/* -------------------------------- */}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">

            <p className="font-medium text-red-600">
              {error}
            </p>

          </div>
        )}

        {/* -------------------------------- */}
        {/* Empty */}
        {/* -------------------------------- */}

        {!loading && !error && courses.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">

            <p className="text-slate-500">
              No published courses available yet.
            </p>

          </div>
        )}

        {/* -------------------------------- */}
        {/* Course Cards */}
        {/* -------------------------------- */}

        {!loading && !error && courses.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {courses
              .filter(
                (course) => course.status === "published"
              )
              .map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                />
              ))}

          </div>
        )}

      </section>

      {/* -------------------------------- */}
      {/* Sign In Modal */}
      {/* -------------------------------- */}

      <SignInForm
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />

    </main>
  );
}