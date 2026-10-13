"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useProgress } from "@/hooks/useProgress";
import { useBookmarks } from "@/hooks/useBookmarks";

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    enrollments,
    loading,
    error,
  } = useEnrollments();

  const { getCourseProgress } = useProgress();
  const { isBookmarked } = useBookmarks();

  const activeEnrollments = enrollments.filter(
    (_) => _.enrollmentStatus === "active"
  );
  const completedEnrollments = enrollments.filter(
    (_) => _.enrollmentStatus === "completed"
  );

  const totalProgress =
    activeEnrollments.length > 0
      ? Math.round(
          activeEnrollments.reduce(
            (acc, course) =>
              acc + getCourseProgress(course.id, course.totalLessons ?? 0).progressPercent,
            0
          ) / activeEnrollments.length
        )
      : 0;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Welcome */}
          <div className="mb-10">
            <p className="text-sm font-medium text-indigo-600">
              Student Dashboard
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
            </h2>

            <p className="mt-2 text-slate-500">
              Continue learning and keep building your skills.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-10 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">
                Enrolled Courses
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {activeEnrollments.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">
                Courses Completed
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {completedEnrollments.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">
                Learning Progress
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalProgress}%
              </p>
            </div>

          </div>

          {/* Course heading */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                My Courses
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Continue where you left off.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/courses")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all
              </button>
              <Link
                href="/"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Browse Catalog
              </Link>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                Loading your courses...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
              <p className="font-medium text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && activeEnrollments.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-slate-500">
                You haven&apos;t enrolled in any courses yet.
              </p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Browse Courses →
              </button>
            </div>
          )}

          {/* Courses */}
          {!loading && !error && activeEnrollments.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {activeEnrollments.map((course) => {
                let thumbnailUrl = "";

                if (course.thumbnail) {
                  if (typeof course.thumbnail === "string") {
                    try {
                      const parsed = JSON.parse(course.thumbnail);
                      thumbnailUrl = parsed?.url ?? "";
                    } catch {
                      thumbnailUrl = course.thumbnail;
                    }
                  } else {
                    thumbnailUrl = course.thumbnail?.url ?? "";
                  }
                }

                return (
                  <div
                    key={course.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                  >

                     {/* Course thumbnail */}
                     <div className="relative flex h-40 items-center justify-center bg-slate-100">
                       {thumbnailUrl ? (
                         <img
                           src={thumbnailUrl}
                           alt={course.title}
                           className="h-full w-full object-cover"
                         />
                       ) : (
                         <div className="flex h-full items-center justify-center text-sm text-slate-400">
                           No thumbnail
                         </div>
                       )}

                       {user && isBookmarked(course.id) && (
                         <span
                           className="absolute top-2 right-2 rounded-full bg-white p-1.5 shadow-sm"
                           aria-label="Bookmarked"
                           title="Bookmarked"
                         >
                           <svg className="h-4 w-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                           </svg>
                         </span>
                       )}
                     </div>

                    <div className="p-5">

                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                        {course.category}
                      </span>

                      <h4 className="mt-4 text-lg font-bold text-slate-900">
                        {course.title}
                      </h4>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {course.description || "No description available."}
                      </p>

                      {/* Progress */}
                      {(() => {
                        const courseProgress = getCourseProgress(
                          course.id,
                          course.totalLessons ?? 0
                        );
                        return (
                          <div className="mt-5">
                            <div className="mb-2 flex justify-between text-xs">
                              <span className="text-slate-500">
                                Progress
                              </span>
                              <span className="font-semibold text-slate-700">
                                {courseProgress.progressPercent}%
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${courseProgress.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      <button
                        type="button"
                        onClick={() => router.push(`/courses/${course.id}`)}
                        className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Continue Learning
                      </button>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </section>
  );
}