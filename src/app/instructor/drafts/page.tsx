"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCourses } from "@/hooks/useCourses";

export default function DraftsPage() {
  const router = useRouter();
  const { courses, loading, error, refetch } = useCourses();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<number | null>(null);

  const draftCourses = courses.filter((course) => course.isDraft);

  const handleDelete = (courseId: number) => {
    setShowConfirm(courseId);
  };

  const confirmDelete = async (courseId: number) => {
    setDeletingId(courseId);
    try {
      const course = draftCourses.find((c) => c.id === courseId);
      const identifier = course?.uuid || Math.abs(courseId).toString();

      const response = await fetch(`/api/course-builder/draft/${identifier}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete draft");
      }

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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Instructor</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Draft Courses</h1>
            <p className="mt-2 text-sm text-slate-500">Manage and continue working on your course drafts</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/instructor"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="text-sm text-slate-500">Loading your drafts...</p>
          </div>
        ) : draftCourses.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50">
              <svg className="h-8 w-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No draft courses yet</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Start a new course draft and work on it at your own pace. Your progress is saved automatically.
            </p>
            <a
              href="/instructor/courses/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Draft
            </a>
          </div>
        ) : (
          /* Draft Courses List */
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Your Draft Courses <span className="ml-2 text-sm font-normal text-slate-500">({draftCourses.length})</span>
                </h2>
              </div>
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
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-4 transition hover:bg-slate-50"
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
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-semibold text-slate-900">{course.title}</h3>

                        <span className="shrink-0 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">Draft</span>

                        {course.sourceCourseId && (
                          <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Pending Changes</span>
                        )}

                        {course.draftStatus && (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">{course.draftStatus}</span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-sm text-slate-500">{course.description || "No description available."}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Step {course.currentStep || 1} of 5
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          {course.completionPct || 0}% complete
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          v{course.version || 1}
                        </span>
                        {course.lastActivityAt && (
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Last edited:{" "}
                            {new Date(course.lastActivityAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-wrap items-center gap-2 sm:ml-auto">
                      {isConfirming ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm text-slate-600">Delete this draft?</p>
                          <button
                            type="button"
                            onClick={() => confirmDelete(course.id)}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelDelete}
                            disabled={isDeleting}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Cancel
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
                            onClick={() => router.push(`/instructor/courses/create?courseCode=${course.uuid}`)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                          >
                            Continue Editing
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