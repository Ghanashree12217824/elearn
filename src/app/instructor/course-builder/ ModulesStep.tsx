"use client";

import { useState } from "react";

import type {
  CourseBuilderModule,
} from "../../../types/course-builder";

type Props = {
  modules: CourseBuilderModule[];

  addModule: (
    module: CourseBuilderModule
  ) => void;

  updateModule: (
    moduleId: number,
    data: Partial<CourseBuilderModule>
  ) => void;

  removeModule: (
    moduleId: number
  ) => void;
};

export default function ModulesStep({
  modules,
  addModule,
  updateModule,
  removeModule,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleAddModule() {
    if (!title.trim()) {
      return;
    }

    const newModule: CourseBuilderModule = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      lessons: [],
    };

    addModule(newModule);

    setTitle("");
    setDescription("");
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Course Modules
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Divide your course into modules to organize
          the learning content.
        </p>
      </div>


      {/* Add Module */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

        <h3 className="text-lg font-semibold text-slate-900">
          Add Module
        </h3>

        <div className="mt-5 space-y-5">

          {/* Module Title */}
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
              placeholder="e.g. HTML Basics"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>


          {/* Description */}
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
              placeholder="What will students learn in this module?"
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>


          {/* Add Button */}
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


      {/* Module List */}
      <div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Your Modules
          </h3>

          <span className="text-sm text-slate-500">
            {modules.length}{" "}
            {modules.length === 1 ? "module" : "modules"}
          </span>
        </div>


        {modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">

            <p className="font-medium text-slate-600">
              No modules added yet
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Add your first module above.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {modules.map((module, index) => (
              <div
                key={module.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex gap-4">

                    {/* Module Number */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                      {index + 1}
                    </div>


                    {/* Module Information */}
                    <div className="min-w-0">

                      <input
                        type="text"
                        value={module.title}
                        onChange={(event) =>
                          updateModule(module.id, {
                            title: event.target.value,
                          })
                        }
                        className="w-full border-0 bg-transparent p-0 text-lg font-semibold text-slate-900 outline-none focus:ring-0"
                      />

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

                      <p className="mt-2 text-xs text-slate-400">
                        {module.lessons.length}{" "}
                        {module.lessons.length === 1
                          ? "lesson"
                          : "lessons"}
                      </p>

                    </div>

                  </div>


                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() =>
                      removeModule(module.id)
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
  );
}