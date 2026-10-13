"use client";

import Link from "next/link";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useProgress } from "@/hooks/useProgress";

type ThumbnailType = { url?: string } | string | null;

function getThumbnailUrl(thumbnail: ThumbnailType): string {
  if (typeof thumbnail === "string") {
    try {
      const parsed = JSON.parse(thumbnail);
      return parsed?.url ?? "";
    } catch {
      return thumbnail;
    }
  }
  return thumbnail?.url ?? "";
}

export default function ProgressPage() {
  const { enrollments, loading: enrollmentsLoading, error: enrollmentsError } = useEnrollments();
  const { progressRecords, loading: progressLoading, error: progressError, getCourseProgress } = useProgress();

  const loading = enrollmentsLoading || progressLoading;
  const error = enrollmentsError || progressError;

  const activeEnrollments = enrollments.filter(
    (e) => e.enrollmentStatus === "active"
  );

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse mb-6" />
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Learning Progress</h1>
        <p className="mt-2 text-slate-500">
          Track your progress across all enrolled courses.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center mb-6">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && activeEnrollments.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10v-2a2 2 0 012-2h2a2 2 0 012 2v2m-4 0h4m-4 0v-4h4v4m-4 0a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2h-2m-4 0h4" />
          </svg>
          <p className="text-slate-500">
            You haven&apos;t enrolled in any courses yet.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {!loading && !error && activeEnrollments.length > 0 && (
        <div className="space-y-6">
          {activeEnrollments.map((course) => {
            const totalLessons = course.totalLessons ?? 0;

            const courseProgress = getCourseProgress(course.id, totalLessons);
            const thumbnailUrl = getThumbnailUrl(course.thumbnail);

            return (
              <div
                key={course.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"
              >
                <div className="flex items-start gap-6">
                  <div className="flex h-24 w-40 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {course.instructorName ?? "Unknown instructor"}
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-indigo-600">
                        {courseProgress.progressPercent}%
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">
                          Progress ({courseProgress.completedLessons}/{courseProgress.totalLessons} lessons completed)
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${courseProgress.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <Link
                        href={`/courses/${course.id}`}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && progressRecords.length > 0 && (
        <details className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900">
            Completed Lessons ({progressRecords.filter((r) => r.completed === 1).length})
          </summary>
          <div className="mt-4 space-y-2">
            {progressRecords
              .filter((r) => r.completed === 1)
              .map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      Lesson {record.lessonId} — {record.lessonTitle ?? "Untitled"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {record.moduleTitle ? `${record.moduleTitle} • ` : ""}
                      {record.courseTitle ?? "Unknown course"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {record.completedAt
                      ? new Date(record.completedAt).toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
              ))}
          </div>
        </details>
      )}
    </section>
  );
}
