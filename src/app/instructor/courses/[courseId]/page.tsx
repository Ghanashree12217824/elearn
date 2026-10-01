"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useModules } from "@/hooks/useModules";

export default function CourseBuilderPage() {
  const params = useParams();

  const courseId = Number(params.courseId);

  const {
    modules,
    loading,
    error,
    getModules,
    createModule,
  } = useModules(courseId);

  const [isAddingModule, setIsAddingModule] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // --------------------------------
  // Load modules
  // --------------------------------

  useEffect(() => {
    if (
      Number.isInteger(courseId) &&
      courseId > 0
    ) {
      getModules();
    }
  }, [courseId]);

  // --------------------------------
  // Create module
  // --------------------------------

  async function handleCreateModule(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setSubmitting(true);

    const success = await createModule(
      title.trim(),
      description.trim(),
    );

    setSubmitting(false);

    if (success) {
      setTitle("");
      setDescription("");
      setIsAddingModule(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* -------------------------------- */}
      {/* Header */}
      {/* -------------------------------- */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-5xl px-6 py-6">

          <p className="text-sm font-semibold text-indigo-600">
            COURSE BUILDER
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Course Content
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Build your course by adding modules
            and lessons.
          </p>

        </div>

      </header>

      {/* -------------------------------- */}
      {/* Content */}
      {/* -------------------------------- */}

      <section className="mx-auto max-w-5xl px-6 py-10">

        {/* -------------------------------- */}
        {/* Module Header */}
        {/* -------------------------------- */}

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Modules
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organize your course into modules.
            </p>
          </div>

          {!isAddingModule && (
            <button
              type="button"
              onClick={() =>
                setIsAddingModule(true)
              }
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Add Module
            </button>
          )}

        </div>

        {/* -------------------------------- */}
        {/* Add Module Form */}
        {/* -------------------------------- */}

        {isAddingModule && (
          <form
            onSubmit={handleCreateModule}
            className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div className="mb-5">

              <h3 className="text-lg font-bold text-slate-900">
                Add Module
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create a new section for your course.
              </p>

            </div>

            {/* Title */}

            <div className="mb-5">

              <label
                htmlFor="module-title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Module Title
              </label>

              <input
                id="module-title"
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. HTML Fundamentals"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            {/* Description */}

            <div className="mb-6">

              <label
                htmlFor="module-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="module-description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value,
                  )
                }
                placeholder="What will students learn in this module?"
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setIsAddingModule(false);
                  setTitle("");
                  setDescription("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !title.trim()
                }
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Creating..."
                  : "Create Module"}
              </button>

            </div>

          </form>
        )}

        {/* -------------------------------- */}
        {/* Error */}
        {/* -------------------------------- */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

          </div>
        )}

        {/* -------------------------------- */}
        {/* Loading */}
        {/* -------------------------------- */}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

            <p className="text-sm text-slate-500">
              Loading modules...
            </p>

          </div>
        )}

        {/* -------------------------------- */}
        {/* Empty */}
        {/* -------------------------------- */}

        {!loading &&
          modules.length === 0 &&
          !isAddingModule && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                +
              </div>

              <h3 className="font-semibold text-slate-900">
                No modules yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Start building your course by
                adding your first module.
              </p>

              <button
                type="button"
                onClick={() =>
                  setIsAddingModule(true)
                }
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                + Add Module
              </button>

            </div>
          )}

        {/* -------------------------------- */}
        {/* Modules */}
        {/* -------------------------------- */}

        {!loading &&
          modules.length > 0 && (
            <div className="space-y-4">

              {modules.map(
                (module, index) => (
                  <article
                    key={module.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    <div className="flex items-start gap-4">

                      {/* Number */}

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                        {index + 1}
                      </div>

                      {/* Module Content */}

                      <div className="min-w-0 flex-1">

                        <h3 className="text-lg font-bold text-slate-900">
                          {module.title}
                        </h3>

                        {module.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {module.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between">

                          <span className="text-xs font-medium text-slate-400">
                            Module {index + 1}
                          </span>

                          <button
                            type="button"
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                          >
                            + Add Lesson
                          </button>

                        </div>

                      </div>

                    </div>

                  </article>
                ),
              )}

            </div>
          )}

      </section>

    </main>
  );
}