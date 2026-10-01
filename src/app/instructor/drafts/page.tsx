"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCourses } from "@/hooks/useCourses";

export default function DraftsPage() {
  const router = useRouter();
  const { courses, loading, error, refetch } = useCourses();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState<number | null>(null);

   // State-driven view toggle: "drafts" or "dashboard"
   // instead of a router.push to /instructor
    const [currentView, setCurrentView] =
      useState<"drafts" | "dashboard">("drafts");

    // When in dashboard view, show only published (non-draft) courses
    const dashboardCourses = courses.filter(
      (course) => !course.isDraft
    );

  // Filter only draft courses
  const draftCourses = courses.filter((course) => course.isDraft);

  const handleDelete = (courseId: number) => {
    setShowConfirm(courseId);
  };

  const confirmDelete = async (courseId: number) => {
    setDeletingId(courseId);
    try {
      // Use the UUID from the course object for deletion
      const course = draftCourses.find((c) => c.id === courseId);
      const identifier = course?.uuid || Math.abs(courseId).toString();

      const response = await fetch(
        `/api/course-builder/draft/${identifier}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete draft");
      }

      // Refresh the courses list
      refetch();
    } catch (err) {
      console.error("Delete draft error:", err);
      alert("Failed to delete draft. Please try again.");
    } finally {
      setDeletingId(null);
      setShowConfirm(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(null);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">INSTRUCTOR</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Draft Courses
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your course drafts.
            </p>
          </div>

           {currentView === "drafts" && (
             <button
               type="button"
               onClick={() => {
                 setCurrentView("dashboard");

                 router.push("/instructor");
               }}
               className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
             >
               Back to Dashboard
             </button>
           )}
         </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

          {/* Loading */}
          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">Loading courses...</p>
            </div>
          ) : currentView === "dashboard" ? (
            /* Dashboard View — published courses */
            dashboardCourses.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <p className="text-sm text-slate-500">
                  No published courses yet.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-slate-900">
                  Published Courses ({dashboardCourses.length})
                </h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {dashboardCourses.map((course) => {
                    let thumbnailUrl = "";

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

                    return (
                      <div
                        key={course.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
                      >
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

                        <div className="p-5">
                          <h3 className="truncate text-lg font-bold text-slate-900">
                            {course.title}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                            {course.description ||
                              "No description available."}
                          </p>

                          <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-900">
                              ₹{course.price ?? 0}
                            </span>

                            <span className="text-slate-500">
                              {course.level ?? "Not specified"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/instructor/courses/${course.id}/edit`
                              )
                            }
                            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                          >
                            Edit Course
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : draftCourses.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">You don&apos;t have any draft courses yet.</p>

            <button
              type="button"
              onClick={() => router.push("/instructor/courses/create")}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create your first draft →
            </button>
          </div>
        ) : (
          /* Draft Courses List */
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Your Draft Courses ({draftCourses.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-200">
              {draftCourses.map((course) => {
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

                const isDeleting = deletingId === course.id;
                const isConfirming = showConfirm === course.id;

                return (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50"
                  >
                    {/* Thumbnail */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
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

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="truncate text-lg font-semibold text-slate-900">
                          {course.title}
                        </h3>

                         <span className="shrink-0 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                           Draft
                         </span>

                         {course.sourceCourseId && (
                           <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                             Pending Changes
                           </span>
                         )}

                         {course.draftStatus && (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
                            {course.draftStatus}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {course.description || "No description available."}
                      </p>

                      <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                        <span>Step {course.currentStep || 1} of 5</span>
                        <span>{course.completionPct || 0}% complete</span>
                        <span>v{course.version || 1}</span>
                        {course.lastActivityAt && (
                          <span>
                            Last edited:{" "}
                            {new Date(course.lastActivityAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {isConfirming ? (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-600">Delete?</p>
                          <button
                            type="button"
                            onClick={() => confirmDelete(course.id)}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            {isDeleting ? "Deleting..." : "Yes"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelDelete}
                            disabled={isDeleting}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/instructor/courses/create?courseCode=${course.uuid}`
                              )
                            }
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(course.id)}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}