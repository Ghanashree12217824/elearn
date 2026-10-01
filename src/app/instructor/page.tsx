"use client";

import { useRouter } from "next/navigation";
import { useCourses } from "@/hooks/useCourses";
import { useInstructorDashboard } from "@/hooks/useInstructorDashboard";
import UserMenu from "@/components/UserMenu";

export default function InstructorDashboard() {
  const router = useRouter();

  const { courses, loading, error } = useCourses();

  const {
    dashboard,
    loading: dashboardLoading,
    error: dashboardError,
  } = useInstructorDashboard();

   // Default view: only published courses.
   // Draft courses are managed separately on the
   // /instructor/drafts page (list format).
   const filteredCourses = courses.filter(
     (course) => !course.isDraft
   );

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">INSTRUCTOR</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your courses and track your students.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/instructor/courses/create")}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Create Course
            </button>

            <UserMenu />
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Courses */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Total Courses</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {dashboardLoading ? "..." : dashboard.totalCourses}
            </p>
          </div>

          {/* Published */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Published</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {dashboardLoading ? "..." : dashboard.publishedCourses}
            </p>
          </div>

          {/* Drafts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Drafts</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {dashboardLoading ? "..." : dashboard.draftCourses}
            </p>
          </div>

          {/* Students */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Students</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {dashboardLoading ? "..." : dashboard.students}
            </p>
          </div>
        </div>

        {/* Dashboard Error */}
        {dashboardError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {dashboardError}
          </div>
        )}

        {/* Your Courses */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Courses</h2>

              <p className="mt-1 text-sm text-slate-500">
                Published courses are shown below. Drafts are managed separately.
              </p>
            </div>

            {/* Course Filter */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/instructor/drafts")}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View All Drafts
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">Loading your courses...</p>
            </div>
           ) : filteredCourses.length === 0 ? (
            /* Empty State */
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">
                {"You haven't published any courses yet."}
              </p>

              <button
                type="button"
                onClick={() => router.push("/instructor/courses/create")}
                className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Create your first course →
              </button>
            </div>
          ) : (
            /* Courses */
            <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => {
                /*
                 * Thumbnail
                 *
                 * New format:
                 * {
                 *   url,
                 *   fileName,
                 *   fileSize,
                 *   mimeType
                 * }
                 *
                 * Old data may still contain:
                 * "http://localhost:3000/..."
                 *
                 * Some existing records may also contain
                 * a JSON string, so handle that safely.
                 */

                let thumbnailUrl = "";

                if (typeof course.thumbnail === "string") {
                  try {
                    const parsedThumbnail = JSON.parse(course.thumbnail);

                    thumbnailUrl = parsedThumbnail?.url ?? "";
                  } catch {
                    thumbnailUrl = course.thumbnail;
                  }
                } else {
                  thumbnailUrl = course.thumbnail?.url ?? "";
                }

                return (
                  <div
                    key={course.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <div className="h-44 bg-slate-100">
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
                    </div>

                    {/* Course Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                          {course.title}
                        </h3>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            course.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                        {course.description || "No description available."}
                      </p>

                      {/* Course Details */}
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-900">
                          ₹{course.price ?? 0}
                        </span>

                        <span className="capitalize text-slate-500">
                          {course.level ?? "Not specified"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          View
                        </button>

                         <button
                           type="button"
                           onClick={() => {
                             if (course.isDraft) {
                               router.push(
                                 `/instructor/courses/create?courseCode=${course.uuid}`,
                               );
                             } else {
                               router.push(
                                 `/instructor/courses/${course.id}/edit`,
                               );
                             }
                           }}
                          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                          {course.isDraft ? "Continue" : "Edit"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
