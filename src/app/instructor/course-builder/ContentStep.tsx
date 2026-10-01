"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  CourseBuilderModule,
  LessonResource,
} from "@/types/course-builder";

let nextResourceId = Date.now();

function createResourceId() {
  nextResourceId += 1;
  return nextResourceId;
}

interface ContentStepProps {
  modules: CourseBuilderModule[];

  addResource: (
    moduleId: number,
    lessonId: number,
    resource: LessonResource
  ) => void;

  removeResource: (
    moduleId: number,
    lessonId: number,
    resourceId: number
  ) => void;
}

export default function ContentStep({
  modules,
  addResource,
  removeResource,
}: ContentStepProps) {
  /* =========================================================
     SELECTED MODULE
  ========================================================= */

  const [selectedModuleId, setSelectedModuleId] =
    useState<number | null>(
      modules.length > 0
        ? modules[0].id
        : null
    );

  /* =========================================================
     SELECTED LESSON
  ========================================================= */

  const [selectedLessonId, setSelectedLessonId] =
    useState<number | null>(
      modules.length > 0 &&
      modules[0].lessons.length > 0
        ? modules[0].lessons[0].id
        : null
    );

  /* =========================================================
     RESOURCE TYPE
  ========================================================= */

  const [resourceType, setResourceType] =
    useState<"file" | "link">("file");

  /* =========================================================
     RESOURCE FORM
  ========================================================= */

  const [resourceTitle, setResourceTitle] =
    useState("");

  const [resourceUrl, setResourceUrl] =
    useState("");

  const [resourceFile, setResourceFile] =
    useState<File | null>(null);

  /* =========================================================
     SYNC MODULE WHEN MODULES CHANGE
     
     Important for edit page because the course is loaded
     asynchronously from the API.
  ========================================================= */

  useEffect(() => {
    if (modules.length === 0) {
      setSelectedModuleId(null);
      setSelectedLessonId(null);
      return;
    }

    setSelectedModuleId((currentModuleId) => {
      const exists = modules.some(
        (module) =>
          module.id === currentModuleId
      );

      return exists
        ? currentModuleId
        : modules[0].id;
    });
  }, [modules]);

  /* =========================================================
     SYNC LESSON WHEN MODULE CHANGES
  ========================================================= */

  useEffect(() => {
    if (!selectedModuleId) {
      setSelectedLessonId(null);
      return;
    }

    const selectedModule =
      modules.find(
        (module) =>
          module.id === selectedModuleId
      );

    if (!selectedModule) {
      setSelectedLessonId(null);
      return;
    }

    setSelectedLessonId(
      (currentLessonId) => {
        const exists =
          selectedModule.lessons.some(
            (lesson) =>
              lesson.id ===
              currentLessonId
          );

        return exists
          ? currentLessonId
          : selectedModule.lessons[0]
              ?.id ?? null;
      }
    );
  }, [
    modules,
    selectedModuleId,
  ]);

  /* =========================================================
     SELECTED MODULE
  ========================================================= */

  const selectedModule =
    modules.find(
      (module) =>
        module.id ===
        selectedModuleId
    );

  /* =========================================================
     SELECTED LESSON
  ========================================================= */

  const selectedLesson =
    selectedModule?.lessons.find(
      (lesson) =>
        lesson.id ===
        selectedLessonId
    );

  /* =========================================================
     MODULE CHANGE
  ========================================================= */

  function handleModuleChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const moduleId =
      Number(event.target.value);

    setSelectedModuleId(
      moduleId
    );

    const nextModule =
      modules.find(
        (module) =>
          module.id === moduleId
      );

    if (
      nextModule &&
      nextModule.lessons.length > 0
    ) {
      setSelectedLessonId(
        nextModule.lessons[0].id
      );
    } else {
      setSelectedLessonId(null);
    }

    resetResourceForm();
  }

  /* =========================================================
     LESSON CHANGE
  ========================================================= */

  function handleLessonChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const lessonId =
      Number(event.target.value);

    setSelectedLessonId(
      lessonId
    );

    resetResourceForm();
  }

  /* =========================================================
     RESOURCE TYPE CHANGE
  ========================================================= */

  function handleResourceTypeChange(
    type: "file" | "link"
  ) {
    setResourceType(type);

    setResourceFile(null);
    setResourceUrl("");
  }

  /* =========================================================
     FILE CHANGE
  ========================================================= */

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ??
      null;

    setResourceFile(file);
  }

  /* =========================================================
     ADD RESOURCE
  ========================================================= */

  function handleAddResource() {
    if (
      selectedModuleId === null ||
      selectedLessonId === null
    ) {
      alert(
        "Please select a module and lesson."
      );

      return;
    }

    if (
      !resourceTitle.trim()
    ) {
      alert(
        "Please enter a resource title."
      );

      return;
    }

    /* =======================================================
       FILE RESOURCE
    ======================================================= */

    if (
      resourceType === "file"
    ) {
      if (!resourceFile) {
        alert(
          "Please select a file."
        );

        return;
      }

      const resource:
        LessonResource = {
        id: createResourceId(),

        title:
          resourceTitle.trim(),

        metadata: {
          /*
           * This is currently a browser preview URL.
           *
           * It is NOT a permanent server URL.
           * The actual file upload should happen when
           * Save Changes / Publish is clicked.
           */
          url:
            URL.createObjectURL(
              resourceFile
            ),

          fileName:
            resourceFile.name,

          fileSize:
            resourceFile.size,

          mimeType:
            resourceFile.type,
        },
      };

      addResource(
        selectedModuleId,
        selectedLessonId,
        resource
      );

      resetResourceForm();

      return;
    }

    /* =======================================================
       EXTERNAL LINK RESOURCE
    ======================================================= */

    if (
      resourceType === "link"
    ) {
      if (
        !resourceUrl.trim()
      ) {
        alert(
          "Please enter a resource URL."
        );

        return;
      }

      const resource:
        LessonResource = {
        id: createResourceId(),

        title:
          resourceTitle.trim(),

        metadata: {
          url:
            resourceUrl.trim(),

          fileName: "",

          fileSize: 0,

          mimeType:
            "text/url",
        },
      };

      addResource(
        selectedModuleId,
        selectedLessonId,
        resource
      );

      resetResourceForm();
    }
  }

  /* =========================================================
     RESET RESOURCE FORM
  ========================================================= */

  function resetResourceForm() {
    setResourceTitle("");

    setResourceUrl("");

    setResourceFile(null);

    setResourceType("file");
  }

  /* =========================================================
     DELETE RESOURCE
  ========================================================= */

  function handleDeleteResource(
    resourceId: number
  ) {
    if (
      selectedModuleId === null ||
      selectedLessonId === null
    ) {
      return;
    }

    removeResource(
      selectedModuleId,
      selectedLessonId,
      resourceId
    );
  }

  /* =========================================================
     NO MODULES
  ========================================================= */

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
        <p className="font-medium text-gray-700">
          No modules available
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Go back to Step 2 and add
          at least one module.
        </p>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Lesson Resources
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Add files or external links
          that students can access
          from a lesson.
        </p>
      </div>

      {/* =====================================================
          MODULE & LESSON SELECTION
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* MODULE */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Module
          </label>

          <select
            value={
              selectedModuleId ?? ""
            }
            onChange={
              handleModuleChange
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option
              value=""
              disabled
            >
              Select Module
            </option>

            {modules.map(
              (module) => (
                <option
                  key={module.id}
                  value={module.id}
                >
                  {module.title}
                </option>
              )
            )}
          </select>
        </div>

        {/* LESSON */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Lesson
          </label>

          <select
            value={
              selectedLessonId ?? ""
            }
            onChange={
              handleLessonChange
            }
            disabled={
              !selectedModule ||
              selectedModule
                .lessons.length === 0
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none disabled:bg-gray-100 focus:border-black"
          >
            <option
              value=""
              disabled
            >
              Select Lesson
            </option>

            {selectedModule?.lessons.map(
              (lesson) => (
                <option
                  key={lesson.id}
                  value={lesson.id}
                >
                  {lesson.title}
                </option>
              )
            )}
          </select>
        </div>

      </div>

      {/* =====================================================
          NO LESSON
      ===================================================== */}

      {!selectedLesson && (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">
            Please create and select
            a lesson before adding
            resources.
          </p>
        </div>
      )}

      {/* =====================================================
          ADD RESOURCE FORM
      ===================================================== */}

      {selectedLesson && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <h3 className="mb-6 text-lg font-semibold text-gray-900">
            Add Resource
          </h3>

          <div className="space-y-6">

            {/* =================================================
                RESOURCE TITLE
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Resource Title
              </label>

              <input
                type="text"
                value={
                  resourceTitle
                }
                onChange={(
                  event
                ) =>
                  setResourceTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. HTML Cheat Sheet"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            {/* =================================================
                RESOURCE TYPE
            ================================================= */}

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Resource Type
              </label>

              <div className="flex gap-3">

                {/* FILE */}

                <button
                  type="button"
                  onClick={() =>
                    handleResourceTypeChange(
                      "file"
                    )
                  }
                  className={`rounded-lg border px-5 py-3 text-sm font-medium transition ${
                    resourceType ===
                    "file"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Upload File
                </button>

                {/* LINK */}

                <button
                  type="button"
                  onClick={() =>
                    handleResourceTypeChange(
                      "link"
                    )
                  }
                  className={`rounded-lg border px-5 py-3 text-sm font-medium transition ${
                    resourceType ===
                    "link"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  External Link
                </button>

              </div>
            </div>

            {/* =================================================
                FILE
            ================================================= */}

            {resourceType ===
              "file" && (
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select File
                </label>

                <input
                  type="file"
                  onChange={
                    handleFileChange
                  }
                  className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-sm file:font-medium"
                />

                {/* FILE PREVIEW */}

                {resourceFile && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-4">

                    <p className="text-sm font-medium text-gray-900">
                      {
                        resourceFile.name
                      }
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {(
                        resourceFile.size /
                        1024
                      ).toFixed(
                        2
                      )}{" "}
                      KB
                      {" • "}
                      {
                        resourceFile.type ||
                        "Unknown file type"
                      }
                    </p>

                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  The file will only be
                  uploaded when you save
                  or publish the course.
                </p>

              </div>
            )}

            {/* =================================================
                EXTERNAL LINK
            ================================================= */}

            {resourceType ===
              "link" && (
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Resource URL
                </label>

                <input
                  type="url"
                  value={
                    resourceUrl
                  }
                  onChange={(
                    event
                  ) =>
                    setResourceUrl(
                      event.target.value
                    )
                  }
                  placeholder="https://example.com/resource"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Add an external resource
                  such as a website,
                  YouTube video, or Google
                  Drive file.
                </p>

              </div>
            )}

            {/* =================================================
                ADD BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={
                handleAddResource
              }
              disabled={
                !resourceTitle.trim() ||
                (
                  resourceType ===
                    "file" &&
                  !resourceFile
                ) ||
                (
                  resourceType ===
                    "link" &&
                  !resourceUrl.trim()
                )
              }
              className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              + Add Resource
            </button>

          </div>
        </div>
      )}

      {/* =====================================================
          EXISTING RESOURCES
      ===================================================== */}

      {selectedLesson &&
        selectedLesson.resources
          .length > 0 && (
          <div>

            <div className="mb-4 flex items-center justify-between">

              <h3 className="text-lg font-semibold text-gray-900">
                Added Resources
              </h3>

              <span className="text-sm text-gray-500">
                {
                  selectedLesson
                    .resources.length
                }{" "}
                {selectedLesson
                  .resources.length ===
                1
                  ? "resource"
                  : "resources"}
              </span>

            </div>

            <div className="space-y-3">

              {selectedLesson.resources.map(
                (resource) => (
                  <div
                    key={
                      resource.id
                    }
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >

                    <div className="flex items-center justify-between gap-4">

                      {/* RESOURCE INFO */}

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-gray-900">
                          {
                            resource.title
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500">

                          {resource.metadata
                            .fileName && (
                            <span>
                              {
                                resource
                                  .metadata
                                  .fileName
                              }
                            </span>
                          )}

                          {resource.metadata
                            .mimeType && (
                            <span>
                              •{" "}
                              {
                                resource
                                  .metadata
                                  .mimeType
                              }
                            </span>
                          )}

                          {resource.metadata
                            .fileSize >
                            0 && (
                            <span>
                              •{" "}
                              {(
                                resource
                                  .metadata
                                  .fileSize /
                                1024
                              ).toFixed(
                                2
                              )}{" "}
                              KB
                            </span>
                          )}

                        </div>

                        {/* URL */}

                        <p className="mt-2 truncate text-xs text-gray-400">
                          {
                            resource
                              .metadata
                              .url
                          }
                        </p>

                      </div>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteResource(
                            resource.id
                          )
                        }
                        className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>
        )}

    </div>
  );
}