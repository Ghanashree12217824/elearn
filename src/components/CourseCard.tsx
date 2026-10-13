"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { CourseResource } from "@/types/course";

type CourseCardProps = {
  course: CourseResource;
};

function getThumbnailUrl(thumbnail: CourseResource["thumbnail"]): string {
  if (typeof thumbnail === "string") {
    try {
      const parsed = JSON.parse(thumbnail);
      return parsed?.url ?? "";
    } catch {
      return thumbnail;
    }
  }

  return (thumbnail as { url?: string } | null)?.url ?? "";
}

export default function CourseCard({
  course,
}: CourseCardProps) {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [bookmarkToggleLoading, setBookmarkToggleLoading] = useState(false);

  const thumbnailUrl = getThumbnailUrl(course.thumbnail);
  const isBookmarkedByCourse = isBookmarked(course.id);

  // Check enrollment status on mount
  useEffect(() => {
    async function checkEnrollment() {
      if (!user) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        const response = await fetch("/api/enrollments");
        if (response.ok) {
          const data = await response.json();
          const enrollments = data.data || [];
          const alreadyEnrolled = enrollments.some(
            (e: { id: number; enrollmentStatus: string }) =>
              e.id === course.id && e.enrollmentStatus === "active"
          );
          setIsEnrolled(alreadyEnrolled);
        }
      } catch {
        // Ignore errors, default to not enrolled
      } finally {
        setCheckingEnrollment(false);
      }
    }

    checkEnrollment();
  }, [user, course.id]);

  const handleEnroll = async () => {
    if (!user) return;

    setIsEnrolling(true);
    setEnrollError("");

    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEnrollError(data.message || "Failed to enroll");
        return;
      }

      setIsEnrolled(true);
    } catch {
      setEnrollError("Something went wrong. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (authLoading || checkingEnrollment) {
    return (
      <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300">
        <div className="h-48 animate-pulse bg-slate-200" />
        <div className="p-5 space-y-4">
          <div className="h-4 animate-pulse bg-slate-200 rounded w-3/4" />
          <div className="h-6 animate-pulse bg-slate-200 rounded w-1/2" />
          <div className="h-4 animate-pulse bg-slate-200 rounded w-full" />
          <div className="h-4 animate-pulse bg-slate-200 rounded w-2/3" />
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No thumbnail
          </div>
        )}

        {/* Bookmark Button */}
        {user && (
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (bookmarkToggleLoading) return;
              setBookmarkToggleLoading(true);
              await toggleBookmark(course.id);
              setBookmarkToggleLoading(false);
            }}
            disabled={bookmarkToggleLoading}
            className={`absolute top-3 right-3 rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:opacity-50 ${isBookmarkedByCourse ? "text-indigo-600" : ""}`}
            aria-label={isBookmarkedByCourse ? "Remove bookmark" : "Bookmark course"}
            title={isBookmarkedByCourse ? "Remove bookmark" : "Bookmark course"}
          >
            {isBookmarkedByCourse ? (
              <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
        )}

        {/* Price */}
        <div className="absolute right-4 top-16 rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-900 shadow-sm">
          {course.price === 0 ? "Free" : `₹${course.price}`}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-2">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900">
          {course.title}
        </h2>

        {/* Instructor */}
        <p className="mt-2 text-sm text-slate-500">
          By{" "}
          <span className="font-medium text-slate-700">
            {course.instructor.name}
          </span>
        </p>

        {/* Course information */}
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 flex-wrap">
          <span>
            {course.modules.length} Modules
          </span>

          <span>•</span>

          <span>
            {course.modules.reduce(
              (total, module) =>
                total + module.lessons.length,
              0
            )}{" "}
            Lessons
          </span>

          <span>•</span>

          <span>
            {course.enrollmentCount ?? 0}{" "}
            {(course.enrollmentCount ?? 0) === 1 ? "Student" : "Students"}
          </span>
        </div>

        {/* Bottom */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-400">
              Course
            </p>

            <p className="font-bold text-slate-900">
              {course.price === 0 ? "Free" : `₹${course.price}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${course.id}`}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Course
            </Link>
            {user ? (
              isEnrolled ? (
                <button
                  type="button"
                  disabled
                  className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white cursor-not-allowed"
                >
                  Enrolled
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnrolling ? "Enrolling..." : "Enroll"}
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => router.push("/signin")}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Sign In to Enroll
              </button>
            )}

            {enrollError && (
              <p className="text-xs text-red-600" role="alert">
                {enrollError}
              </p>
            )}
          </div>

        </div>

      </div>
    </article>
  );
}