"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  CourseBuilderLesson,
  CourseBuilderModule,
  LessonContent,
  LessonContentType,
} from "@/types/course-builder";

type Props = {
  modules: CourseBuilderModule[];

  addLesson: (
    moduleId: number,
    lesson: CourseBuilderLesson
  ) => void;

  updateLesson: (
    moduleId: number,
    lessonId: number,
    data: Partial<CourseBuilderLesson>
  ) => void;

  removeLesson: (
    moduleId: number,
    lessonId: number
  ) => void;

  setLessonContent: (
    moduleId: number,
    lessonId: number,
    content: LessonContent
  ) => void;
};

/* =========================================================
   URL METADATA
========================================================= */

function createUrlMetadata(
  url: string,
  fallbackFileName: string,
  mimeType: string
) {
  try {
    const parsedUrl = new URL(url);

    const rawFileName =
      parsedUrl.pathname
        .split("/")
        .filter(Boolean)
        .pop();

    let fileName =
      rawFileName ??
      fallbackFileName;

    try {
      fileName =
        decodeURIComponent(
          fileName
        );
    } catch {
      fileName =
        rawFileName ??
        fallbackFileName;
    }

    return {
      url: parsedUrl.toString(),
      fileName,
      fileSize: 0,
      mimeType,
    };
  } catch {
    return null;
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LessonsStep({
  modules,
  addLesson,
  updateLesson,
  removeLesson,
  setLessonContent,
}: Props) {

  // =======================================================
  // SELECTED MODULE
  // =======================================================

  const [
    selectedModuleId,
    setSelectedModuleId,
  ] = useState<number | null>(
    modules.length > 0
      ? modules[0].id
      : null
  );

  // =======================================================
  // LESSON FORM
  // =======================================================

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  // =======================================================
  // MAIN CONTENT
  // =======================================================

  const [
    contentType,
    setContentType,
  ] =
    useState<LessonContentType>(
      "text"
    );

  const [body, setBody] =
    useState("");

  const [caption, setCaption] =
    useState("");

  const [contentUrl, setContentUrl] =
    useState("");

  // =======================================================
  // EDITING LESSON
  // =======================================================

  const [
    editingLessonId,
    setEditingLessonId,
  ] = useState<number | null>(
    null
  );

  // =======================================================
  // SELECTED MODULE
  // =======================================================

  const selectedModule =
    modules.find(
      (module) =>
        module.id ===
        selectedModuleId
    );

  // =======================================================
  // SYNCHRONIZE MODULE AFTER API LOAD
  // =======================================================

  useEffect(() => {
    if (modules.length === 0) {
      setSelectedModuleId(null);
      return;
    }

    setSelectedModuleId(
      (currentId) => {
        const stillExists =
          modules.some(
            (module) =>
              module.id ===
              currentId
          );

        return stillExists
          ? currentId
          : modules[0].id;
      }
    );
  }, [modules]);

  // =======================================================
  // SELECT MODULE
  // =======================================================

  function handleModuleChange(
    moduleId: number
  ) {
    setSelectedModuleId(
      moduleId
    );

    clearLessonForm();
  }

  // =======================================================
  // CLEAR FORM
  // =======================================================

  function clearLessonForm() {
    setEditingLessonId(null);

    setTitle("");
    setDescription("");

    setContentType("text");

    setBody("");
    setCaption("");
    setContentUrl("");
  }

  // =======================================================
  // CREATE MAIN CONTENT
  // =======================================================

  function createLessonContent(
    existingContentId?: string
  ): LessonContent | null {

    const content: LessonContent = {
      contentId:
        existingContentId ??
        crypto.randomUUID(),

      type: contentType,
    };

    // =====================================================
    // TEXT
    // =====================================================

    if (
      contentType === "text"
    ) {
      if (!body.trim()) {
        return null;
      }

      content.body =
        body.trim();
    }

    // =====================================================
    // VIDEO / IMAGE / PDF /
    // EXTERNAL LINK
    // =====================================================

    else {
      if (!contentUrl.trim()) {
        return null;
      }

      const mimeType =
        contentType === "pdf"
          ? "application/pdf"
          : contentType === "image"
            ? "image/*"
            : contentType === "video"
              ? "video/*"
              : "text/uri-list";

      const metadata =
        createUrlMetadata(
          contentUrl.trim(),
          contentType ===
            "external_link"
            ? "external-link"
            : "content",
          mimeType
        );

      if (!metadata) {
        return null;
      }

      content.metadata =
        metadata;

      if (
        contentType === "video"
      ) {
        content.caption =
          caption.trim();
      }
    }

    return content;
  }

  // =======================================================
  // ADD NEW LESSON
  // =======================================================

  function handleAddLesson() {
    if (
      !selectedModuleId ||
      !title.trim()
    ) {
      return;
    }

    const content =
      createLessonContent();

    if (!content) {
      return;
    }

    const newLesson:
      CourseBuilderLesson = {
      id: Date.now(),

      title:
        title.trim(),

      description:
        description.trim(),

      content,

      resources: [],
    };

    addLesson(
      selectedModuleId,
      newLesson
    );

    clearLessonForm();
  }

  // =======================================================
  // EDIT EXISTING LESSON
  // =======================================================

  function handleEditLesson(
    lesson: CourseBuilderLesson
  ) {
    setEditingLessonId(
      lesson.id
    );

    setTitle(
      lesson.title
    );

    setDescription(
      lesson.description
    );

    // -----------------------------------------------------
    // No content
    // -----------------------------------------------------

    if (!lesson.content) {
      setContentType("text");

      setBody("");
      setCaption("");
      setContentUrl("");

      return;
    }

    // -----------------------------------------------------
    // Existing content
    // -----------------------------------------------------

    setContentType(
      lesson.content.type
    );

    setBody(
      lesson.content.body ??
        ""
    );

    setCaption(
      lesson.content.caption ??
        ""
    );

    setContentUrl(
      lesson.content.metadata
        ?.url ?? ""
    );
  }

  // =======================================================
  // UPDATE EXISTING LESSON
  // =======================================================

  function handleUpdateLesson() {
    if (
      !selectedModuleId ||
      !editingLessonId ||
      !title.trim()
    ) {
      return;
    }

    const existingLesson =
      selectedModule?.lessons.find(
        (lesson) =>
          lesson.id ===
          editingLessonId
      );

    if (!existingLesson) {
      return;
    }

    /*
     * Preserve the existing contentId
     * when editing the lesson.
     */

    const content =
      createLessonContent(
        existingLesson.content
          ?.contentId
      );

    if (!content) {
      return;
    }

    updateLesson(
      selectedModuleId,
      editingLessonId,
      {
        title:
          title.trim(),

        description:
          description.trim(),

        content,
      }
    );

    clearLessonForm();
  }

  // =======================================================
  // CANCEL EDIT
  // =======================================================

  function handleCancelEdit() {
    clearLessonForm();
  }

  // =======================================================
  // NO MODULES
  // =======================================================

  if (modules.length === 0) {
    return (
      <div className="py-12 text-center">

        <p className="font-medium text-slate-600">
          No modules available
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Go back to Step 2 and
          add at least one module.
        </p>

      </div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="space-y-8">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Course Lessons
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add lessons and their
          main content to each
          module.
        </p>
      </div>

      {/* ===================================================
          MAIN LAYOUT
      =================================================== */}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

        {/* =================================================
            MODULE LIST
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Modules
          </h3>

          <div className="space-y-2">

            {modules.map(
              (
                module,
                index
              ) => {

                const isSelected =
                  module.id ===
                  selectedModuleId;

                return (
                  <button
                    key={
                      module.id
                    }
                    type="button"
                    onClick={() =>
                      handleModuleChange(
                        module.id
                      )
                    }
                    className={`w-full rounded-xl p-3 text-left transition ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isSelected
                            ? "bg-white/20"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold">
                          {module.title}
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            isSelected
                              ? "text-indigo-100"
                              : "text-slate-400"
                          }`}
                        >
                          {
                            module
                              .lessons
                              .length
                          }{" "}
                          {module
                            .lessons
                            .length ===
                          1
                            ? "lesson"
                            : "lessons"}
                        </p>

                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>
        </div>

        {/* =================================================
            LESSON AREA
        ================================================= */}

        <div className="space-y-6">

          {/* =================================================
              SELECTED MODULE
          ================================================= */}

          {selectedModule && (
            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                Selected Module
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {
                  selectedModule.title
                }
              </h3>

              {selectedModule.description && (
                <p className="mt-1 text-sm text-slate-500">
                  {
                    selectedModule.description
                  }
                </p>
              )}

            </div>
          )}

          {/* =================================================
              LESSON FORM
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

            <div className="flex items-center justify-between">

              <h3 className="text-lg font-semibold text-slate-900">
                {editingLessonId
                  ? "Edit Lesson"
                  : "Add Lesson"}
              </h3>

              {editingLessonId && (
                <button
                  type="button"
                  onClick={
                    handleCancelEdit
                  }
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel Edit
                </button>
              )}

            </div>

            <div className="mt-5 space-y-5">

              {/* =================================================
                  LESSON TITLE
              ================================================= */}

              <div>

                <label
                  htmlFor="lesson-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Lesson Title
                </label>

                <input
                  id="lesson-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Introduction to HTML"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>

              {/* =================================================
                  LESSON DESCRIPTION
              ================================================= */}

              <div>

                <label
                  htmlFor="lesson-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Lesson Description
                </label>

                <textarea
                  id="lesson-description"
                  rows={3}
                  value={
                    description
                  }
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="What will students learn in this lesson?"
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>

              {/* =================================================
                  MAIN CONTENT
              ================================================= */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5">

                <div>

                  <h4 className="text-base font-semibold text-slate-900">
                    Main Content
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Add the main content
                    students will study
                    in this lesson.
                  </p>

                </div>

                {/* =================================================
                    CONTENT TYPE
                ================================================= */}

                <div className="mt-5">

                  <label
                    htmlFor="lesson-content-type"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Content Type
                  </label>

                  <select
                    id="lesson-content-type"
                    value={
                      contentType
                    }
                    onChange={(
                      event
                    ) => {

                      setContentType(
                        event.target
                          .value as LessonContentType
                      );

                      setBody("");
                      setCaption("");
                      setContentUrl("");
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >

                    <option value="text">
                      Text / Article
                    </option>

                    <option value="video">
                      Video
                    </option>

                    <option value="image">
                      Image
                    </option>

                    <option value="pdf">
                      PDF / Document
                    </option>

                    <option value="external_link">
                      External Link
                    </option>

                  </select>

                </div>

                {/* =================================================
                    TEXT
                ================================================= */}

                {contentType ===
                  "text" && (
                  <div className="mt-5">

                    <label
                      htmlFor="lesson-content-body"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Lesson Body
                    </label>

                    <textarea
                      id="lesson-content-body"
                      rows={10}
                      value={body}
                      onChange={(
                        event
                      ) =>
                        setBody(
                          event.target
                            .value
                        )
                      }
                      placeholder="Enter your lesson content..."
                      className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      This will later be
                      replaced with the
                      rich text editor.
                    </p>

                  </div>
                )}

                {/* =================================================
                    VIDEO
                ================================================= */}

                {contentType ===
                  "video" && (
                  <div className="mt-5 space-y-5">

                    <div>

                      <label
                        htmlFor="lesson-video-url"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Video URL
                      </label>

                      <input
                        id="lesson-video-url"
                        type="url"
                        value={
                          contentUrl
                        }
                        onChange={(
                          event
                        ) =>
                          setContentUrl(
                            event.target
                              .value
                          )
                        }
                        placeholder="https://example.com/video.mp4"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                    </div>

                    <div>

                      <label
                        htmlFor="lesson-video-caption"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Caption
                      </label>

                      <input
                        id="lesson-video-caption"
                        type="text"
                        value={
                          caption
                        }
                        onChange={(
                          event
                        ) =>
                          setCaption(
                            event.target
                              .value
                          )
                        }
                        placeholder="Introduction video"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                    </div>

                  </div>
                )}

                {/* =================================================
                    IMAGE / PDF
                ================================================= */}

                {(
                  contentType ===
                    "image" ||
                  contentType ===
                    "pdf"
                ) && (
                  <div className="mt-5">

                    <label
                      htmlFor="lesson-content-url"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      File URL
                    </label>

                    <input
                      id="lesson-content-url"
                      type="url"
                      value={
                        contentUrl
                      }
                      onChange={(
                        event
                      ) =>
                        setContentUrl(
                          event.target
                            .value
                        )
                      }
                      placeholder={
                        contentType ===
                        "pdf"
                          ? "https://example.com/file.pdf"
                          : "https://example.com/image.jpg"
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>
                )}

                {/* =================================================
                    EXTERNAL LINK
                ================================================= */}

                {contentType ===
                  "external_link" && (
                  <div className="mt-5">

                    <label
                      htmlFor="lesson-external-url"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      External URL
                    </label>

                    <input
                      id="lesson-external-url"
                      type="url"
                      value={
                        contentUrl
                      }
                      onChange={(
                        event
                      ) =>
                        setContentUrl(
                          event.target
                            .value
                        )
                      }
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>
                )}

              </div>

              {/* =================================================
                  ADD / UPDATE BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={
                  editingLessonId
                    ? handleUpdateLesson
                    : handleAddLesson
                }
                disabled={
                  !title.trim() ||
                  !(
                    contentType ===
                    "text"
                      ? body.trim()
                      : contentUrl.trim()
                  )
                }
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingLessonId
                  ? "Update Lesson"
                  : "+ Add Lesson"}
              </button>

            </div>

          </div>

          {/* =================================================
              LESSON LIST
          ================================================= */}

          <div>

            <div className="mb-4 flex items-center justify-between">

              <h3 className="text-lg font-semibold text-slate-900">
                Lessons
              </h3>

              <span className="text-sm text-slate-500">
                {
                  selectedModule
                    ?.lessons.length ??
                  0
                }{" "}
                {
                  selectedModule
                    ?.lessons.length ===
                  1
                    ? "lesson"
                    : "lessons"
                }
              </span>

            </div>

            {/* =================================================
                NO LESSONS
            ================================================= */}

            {selectedModule
              ?.lessons.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center">

                <p className="font-medium text-slate-600">
                  No lessons added
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Add a lesson using
                  the form above.
                </p>

              </div>
            ) : (

              /* =================================================
                 LESSON LIST
              ================================================= */

              <div className="space-y-3">

                {selectedModule?.lessons.map(
                  (
                    lesson,
                    index
                  ) => (

                    <div
                      key={
                        lesson.id
                      }
                      className={`rounded-2xl border bg-white p-5 shadow-sm ${
                        editingLessonId ===
                        lesson.id
                          ? "border-indigo-400 ring-2 ring-indigo-100"
                          : "border-slate-200"
                      }`}
                    >

                      <div className="flex items-start gap-4">

                        {/* =====================================
                            NUMBER
                        ===================================== */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                          {index + 1}
                        </div>

                        {/* =====================================
                            DETAILS
                        ===================================== */}

                        <div className="min-w-0 flex-1">

                          <p className="text-base font-semibold text-slate-900">
                            {
                              lesson.title
                            }
                          </p>

                          {lesson.description && (
                            <p className="mt-2 text-sm text-slate-500">
                              {
                                lesson.description
                              }
                            </p>
                          )}

                          {/* Content information */}

                          <div className="mt-3 flex flex-wrap gap-2">

                            {lesson.content ? (
                              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium capitalize text-green-600">
                                Content:{" "}
                                {
                                  lesson
                                    .content
                                    .type
                                }
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                                No content
                              </span>
                            )}

                            {lesson.resources.length >
                              0 && (
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                                {
                                  lesson
                                    .resources
                                    .length
                                }{" "}
                                {
                                  lesson
                                    .resources
                                    .length ===
                                  1
                                    ? "resource"
                                    : "resources"
                                }
                              </span>
                            )}

                          </div>

                        </div>

                        {/* =====================================
                            ACTIONS
                        ===================================== */}

                        <div className="flex shrink-0 items-center gap-2">

                          {/* Edit */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEditLesson(
                                lesson
                              )
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                          >
                            Edit
                          </button>

                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() =>
                              removeLesson(
                                selectedModule.id,
                                lesson.id
                              )
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}