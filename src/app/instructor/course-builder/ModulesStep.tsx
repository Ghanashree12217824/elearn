"use client";

import { useState } from "react";

import type { CourseBuilderModule } from "@/types/course-builder";

type Props = {
  modules: CourseBuilderModule[];
  addModule: (module: CourseBuilderModule) => void;
  updateModule: (
    moduleId: number,
    data: Partial<CourseBuilderModule>,
  ) => void;
  removeModule: (moduleId: number) => void;
};

export default function ModulesStep({
  modules,
  addModule,
  updateModule,
  removeModule,
}: Props) {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(
    null,
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const selectedModule = modules.find(
    (module) => module.id === selectedModuleId,
  );

  function handleAddModule() {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      return;
    }

    const newModule: CourseBuilderModule = {
      id: Date.now(),
      title: trimmedTitle,
      description: trimmedDescription,
      lessons: [],
    };

    addModule(newModule);

    // Select the newly created module
    setSelectedModuleId(newModule.id);

    // Clear form
    setTitle("");
    setDescription("");
  }

  function handleDeleteModule(moduleId: number) {
    removeModule(moduleId);

    // If deleting the selected module,
    // select another module if one exists
    if (moduleId === selectedModuleId) {
      const remainingModules = modules.filter(
        (module) => module.id !== moduleId,
      );

      setSelectedModuleId(
        remainingModules.length > 0
          ? remainingModules[0].id
          : null,
      );
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Course Modules
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add modules to organize your course content.
        </p>
      </div>

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        
        {/* LEFT - MODULE LIST */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Modules
          </h3>

          {modules.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No modules yet
            </p>
          ) : (
            <div className="space-y-2">
              {modules.map((module, index) => (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setSelectedModuleId(module.id)}
                  className={`w-full rounded-xl p-3 text-left transition ${
                    module.id === selectedModuleId
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {module.title}
                      </p>

                      <p className="mt-1 text-xs opacity-70">
                        {module.lessons.length}{" "}
                        {module.lessons.length === 1
                          ? "lesson"
                          : "lessons"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* SELECTED MODULE */}
          {selectedModule && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                Selected Module
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {selectedModule.title}
              </h3>

              {selectedModule.description && (
                <p className="mt-1 text-sm text-slate-500">
                  {selectedModule.description}
                </p>
              )}
            </div>
          )}

          {/* ADD MODULE FORM */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Add Module
            </h3>

            <div className="mt-5 space-y-5">

              {/* TITLE */}
              <div>
                <label
                  htmlFor="module-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Module Title
                </label>

                <input
                  id="module-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Introduction to HTML"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="module-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Module Description
                </label>

                <textarea
                  id="module-description"
                  rows={3}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="What will this module cover?"
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* ADD BUTTON */}
              <button
                type="button"
                onClick={handleAddModule}
                disabled={!title.trim()}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Add Module
              </button>
            </div>
          </div>

          {/* MODULE CARDS */}
          {modules.length > 0 && (
            <div className="space-y-3">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 flex-1 gap-4">

                      {/* NUMBER */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">

                        {/* TITLE */}
                        <input
                          type="text"
                          value={module.title}
                          onChange={(event) =>
                            updateModule(module.id, {
                              title: event.target.value,
                            })
                          }
                          className="w-full border-0 bg-transparent p-0 text-base font-semibold text-slate-900 outline-none focus:ring-0"
                        />

                        {/* DESCRIPTION */}
                        <textarea
                          value={module.description}
                          onChange={(event) =>
                            updateModule(module.id, {
                              description: event.target.value,
                            })
                          }
                          rows={2}
                          placeholder="Module description"
                          className="mt-2 w-full resize-none border-0 bg-transparent p-0 text-sm text-slate-500 outline-none focus:ring-0"
                        />

                        {/* LESSON COUNT */}
                        <p className="mt-2 text-xs text-slate-400">
                          {module.lessons.length}{" "}
                          {module.lessons.length === 1
                            ? "lesson"
                            : "lessons"}
                        </p>
                      </div>
                    </div>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteModule(module.id)
                      }
                      className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}