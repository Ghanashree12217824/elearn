"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import CourseInformation from "@/app/instructor/course-builder/CourseInformation";
import ModulesStep from "@/app/instructor/course-builder/ModulesStep";
import LessonsStep from "@/app/instructor/course-builder/LessonsStep";
import ContentStep from "@/app/instructor/course-builder/ContentStep";
import ReviewStep from "@/app/instructor/course-builder/ReviewStep";

import { useCourseBuilder } from "@/hooks/useCourseBuilder";

import type {
  CourseBuilderDraft,
  CourseThumbnail,
  LessonContent,
  LessonResource,
} from "@/types/course-builder";

export default function EditCoursePage() {
  const params =
    useParams<{ courseId: string }>();

  const router = useRouter();

  const courseId = params.courseId;

   const {
     course,
     loadCourse,
     updateCourse,
     setThumbnailFile,
     thumbnailFile,
     
     addModule,
     updateModule,
     removeModule,

     addLesson,
     updateLesson,
     removeLesson,

     setLessonContent,

     addResource,
     removeResource,

      draftError,

      saveAsDraft,
    } = useCourseBuilder();

  const [currentStep, setCurrentStep] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [saveSuccess, setSaveSuccess] =
    useState("");

   const [saveError, setSaveError] =
     useState("");

   const [courseStatus, setCourseStatus] =
     useState("");

   // =========================================================
   // LOAD COURSE
   // =========================================================

   useEffect(() => {
    const abortController = new AbortController();

    async function getCourse() {
      if (!courseId) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/instructor/courses/${courseId}`,
          {
            method: "GET",
            cache: "no-store",
            signal: abortController.signal,
          }
        );

        if (abortController.signal.aborted) return;

        const data = await response.json();

        if (response.status === 401) {
          router.push("/signin");
          return;
        }

        if (!response.ok) {
          setError(
            data.message || "Failed to load course."
          );

          return;
        }

        if (!data.data || !data.data.course) {
          setError("Invalid course response.");

          return;
        }

         const apiCourse = data.data.course;

         setCourseStatus(apiCourse.status ?? "");

        const apiModules = Array.isArray(data.data.modules)
          ? data.data.modules
          : [];

        // =====================================================
        // THUMBNAIL
        // =====================================================

        let thumbnail:
          | CourseThumbnail
          | null = null;

        if (apiCourse.thumbnail) {
          if (typeof apiCourse.thumbnail === "string") {
            try {
              const parsed = JSON.parse(apiCourse.thumbnail);

              if (parsed && typeof parsed === "object") {
                thumbnail = {
                  url: parsed.url ?? "",

                  fileName: parsed.fileName ?? "",

                  fileSize: parsed.fileSize ?? 0,

                  mimeType: parsed.mimeType ?? "",
                };
              } else {
                thumbnail = {
                  url: apiCourse.thumbnail,

                  fileName: "",

                  fileSize: 0,

                  mimeType: "",
                };
              }
            } catch {
              thumbnail = {
                url: apiCourse.thumbnail,

                fileName: "",

                fileSize: 0,

                mimeType: "",
              };
            }
          } else {
            thumbnail = {
              url: apiCourse.thumbnail.url ?? "",

              fileName: apiCourse.thumbnail.fileName ?? "",

              fileSize: apiCourse.thumbnail.fileSize ?? 0,

              mimeType: apiCourse.thumbnail.mimeType ?? "",
            };
          }
        }

        // =====================================================
        // MODULES
        // =====================================================

        const modules = apiModules.map(
          (module: any) => ({
            id: Number(module.id),

            title: module.title ?? "",

            description: module.description ?? "",

            lessons:
              Array.isArray(module.lessons)
                ? module.lessons.map(
                    (lesson: any) => {
                      let content:
                        | LessonContent
                        | null = null;

                      // =====================================
                      // LESSON CONTENT
                      // =====================================

                      if (lesson.content) {
                        const rawContent = lesson.content;

                        content = {
                          contentId:
                            rawContent.contentId ??
                            crypto.randomUUID(),

                          type: rawContent.type ?? "text",

                          body: rawContent.body,

                          caption: rawContent.caption,

                          metadata: rawContent.metadata,
                        };
                      }

                      // =====================================
                      // RESOURCES
                      // =====================================

                      const resources: LessonResource[] =
                        Array.isArray(lesson.resources)
                          ? lesson.resources.map(
                              (resource: any) => ({
                                id: Number(resource.id),

                                title: resource.title ?? "",

                                metadata: {
                                  url:
                                    resource.metadata?.url ??
                                    "",

                                  fileName:
                                    resource.metadata
                                      ?.fileName ?? "",

                                  fileSize:
                                    resource.metadata
                                      ?.fileSize ?? 0,

                                  mimeType:
                                    resource.metadata
                                      ?.mimeType ?? "",
                                },
                              })
                            )
                          : [];

                      return {
                        id: Number(lesson.id),

                        title: lesson.title ?? "",

                        description:
                          lesson.description ?? "",

                        content,

                        resources,
                      };
                    }
                  )
                : [],
          })
        );

        // =====================================================
        // BUILDER STATE
        // =====================================================

        const builderData: CourseBuilderDraft = {
          course: {
            id: Number(apiCourse.id),

            title: apiCourse.title ?? "",

            description: apiCourse.description ?? "",

            thumbnail,

            category: apiCourse.category
              ? {
                  id: Number(apiCourse.category.id),

                  title: apiCourse.category.name ?? "",
                }
              : null,

            instructor: null,

            price: Number(apiCourse.price ?? 0),

            level: apiCourse.level ?? "beginner",

            tags: Array.isArray(apiCourse.tags)
              ? apiCourse.tags.map((tag: any) => ({
                  id: Number(tag.id),

                  name: tag.name ?? "",
                }))
              : [],
          },

          modules,
        };

        if (!abortController.signal.aborted) {
          loadCourse(builderData);
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        )
          return;
        console.error("Get course error:", error);

        if (!abortController.signal.aborted) {
          setError("Failed to load course.");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (courseId) {
      getCourse();
    }

    return () => abortController.abort();
  }, [courseId, loadCourse]);

  // =========================================================
  // SAVE CHANGES
  // =========================================================

 async function handleSaveChanges() {
  if (!courseId) {
    setSaveError("Course ID is missing");
    return;
  }

  try {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    // =====================================================
    // CREATE FORM DATA
    // =====================================================

    const formData = new FormData();

    formData.append(
      "course",
      JSON.stringify(course.course)
    );

    formData.append(
      "modules",
      JSON.stringify(course.modules)
    );

    // =====================================================
    // ADD NEW THUMBNAIL IF SELECTED
    // =====================================================

    if (thumbnailFile) {
      formData.append(
        "thumbnail",
        thumbnailFile
      );
    }

    // =====================================================
    // SEND PATCH REQUEST
    // =====================================================

    const response = await fetch(
      `/api/instructor/courses/${courseId}`,
      {
        method: "PATCH",
        body: formData,
      }
    );

    // =====================================================
    // CHECK RESPONSE TYPE
    // =====================================================

    const contentType =
      response.headers.get(
        "content-type"
      );

    const hasJsonBody =
      contentType?.includes(
        "application/json"
      );

    if (!hasJsonBody) {
      const text =
        await response.text().catch(
          () => ""
        );

      console.error(
        "Non-JSON response:",
        response.status,
        text
      );

      setSaveError(
        `Server error (${response.status}): ${
          text || "No response body"
        }`
      );

      return;
    }

    const data =
      await response.json();

    // =====================================================
    // UNAUTHORIZED
    // =====================================================

    if (response.status === 401) {
      router.push("/signin");
      return;
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (!response.ok) {
      setSaveError(
        data.reason ||
          data.message ||
          "Failed to update course."
      );

      return;
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    setSaveSuccess(
      data.message ||
        "Course updated successfully."
    );

    /*
     * Give the user a moment to see the
     * success message before returning
     * to the dashboard.
     */

    setTimeout(() => {
      router.push(
        "/instructor"
      );
    }, 1000);

  } catch (error) {
    console.error(
      "Save course error:",
      error
    );

    setSaveError(
      "Something went wrong while saving the course."
    );

   } finally {
     setSaving(false);
   }
 }

   // =========================================================
   // SAVE AS DRAFT (pending changes for published course)
   // =========================================================

   async function handleSaveDraft() {
     if (!courseId) {
       setSaveError("Course ID is missing");
       return;
     }

     try {
       setSaving(true);
       setSaveError("");
       setSaveSuccess("");

       /*
        * Save the current builder state as a draft
        * linked to the published course via sourceCourseId.
        * This stores pending changes without touching
        * the live course content.
        */
       const result = await saveAsDraft(
         Number(courseId)
       );

       if (!result.success) {
         return;
       }

        setSaveSuccess(
          "Pending changes saved as draft. " +
          "Review them in your drafts list."
        );

        setTimeout(() => {
          router.push(
            "/instructor"
          );
        }, 1000);
     } catch (error) {
       console.error(
         "Save draft error:",
         error
       );

       setSaveError(
         "Something went wrong while saving the draft."
       );
      } finally {
        setSaving(false);
      }
    }

   // =========================================================
   // LOADING
   // =========================================================

   if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm text-slate-500">
            Loading course...
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // LOAD ERROR
  // =========================================================

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">

          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/instructor"
              )
            }
            className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to Dashboard
          </button>

        </div>
      </main>
    );
  }

  // =========================================================
  // STEPS
  // =========================================================

  const steps = [
    {
      id: 1,
      title: "Course Information",
    },

    {
      id: 2,
      title: "Modules",
    },

    {
      id: 3,
      title: "Lessons",
    },

    {
      id: 4,
      title: "Lesson Resources",
    },

    {
      id: 5,
      title: "Review",
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/instructor"
              )
            }
            className="mb-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Edit Course
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Update your course information,
            modules, lessons and resources.
          </p>

        </div>

        {/* =================================================
            STEP NAVIGATION
        ================================================= */}

        <div className="mb-8 overflow-x-auto">

          <div className="flex min-w-max items-center gap-2">

            {steps.map(
              (step) => {
                const active =
                  currentStep ===
                  step.id;

                const completed =
                  currentStep >
                  step.id;

                return (
                  <button
                    key={
                      step.id
                    }
                    type="button"
                    onClick={() =>
                      setCurrentStep(
                        step.id
                      )
                    }
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-indigo-600 text-white"
                        : completed
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-white text-slate-500 hover:bg-slate-100"
                    }`}
                  >

                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                        active
                          ? "bg-white/20"
                          : completed
                            ? "bg-indigo-100"
                            : "bg-slate-100"
                      }`}
                    >
                      {step.id}
                    </span>

                    {step.title}

                  </button>
                );
              }
            )}

          </div>

        </div>

        {/* =================================================
            BUILDER
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* COURSE INFORMATION */}

          {currentStep === 1 && (
            <CourseInformation
              course={
                course.course
              }
              updateCourse={
                updateCourse
              }
              setThumbnailFile={
                setThumbnailFile
              }
            />
          )}

          {/* MODULES */}

          {currentStep === 2 && (
            <ModulesStep
              modules={
                course.modules
              }
              addModule={
                addModule
              }
              updateModule={
                updateModule
              }
              removeModule={
                removeModule
              }
            />
          )}

          {/* LESSONS */}

          {currentStep === 3 && (
            <LessonsStep
              modules={
                course.modules
              }
              addLesson={
                addLesson
              }
              updateLesson={
                updateLesson
              }
              removeLesson={
                removeLesson
              }
              setLessonContent={
                setLessonContent
              }
            />
          )}

          {/* RESOURCES */}

          {currentStep === 4 && (
            <ContentStep
              modules={
                course.modules
              }
              addResource={
                addResource
              }
              removeResource={
                removeResource
              }
            />
          )}

          {/* REVIEW */}

          {currentStep === 5 && (
            <ReviewStep
              course={
                course
              }
            />
          )}

        </div>

        {/* =================================================
            SAVE ERROR
        ================================================= */}

        {saveError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm font-semibold text-red-700">
              Failed to save course
            </p>

            <p className="mt-1 text-sm text-red-600">
              {saveError}
            </p>

          </div>
        )}

        {/* =================================================
            SAVE SUCCESS
        ================================================= */}

        {saveSuccess && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">

            <p className="text-sm font-semibold text-green-700">
              {saveSuccess}
            </p>

            <p className="mt-1 text-sm text-green-600">
              Redirecting to dashboard...
            </p>

          </div>
        )}

        {/* =================================================
            DRAFT ERROR
        ================================================= */}

         {draftError && (
           <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
             {draftError}
           </div>
         )}

{/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="mt-6 flex items-center justify-between">

          {/* PREVIOUS / CANCEL */}

          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (
                currentStep ===
                1
              ) {
                router.push(
                  "/instructor"
                );

                return;
              }

              setCurrentStep(
                (previous) =>
                  previous - 1
              );
            }}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {currentStep === 1
              ? "Cancel"
              : "← Previous"}
          </button>

          {/* RIGHT BUTTONS */}

          <div className="flex items-center gap-3">

            {/* NEXT */}

            {currentStep <
              steps.length && (
              <button
                type="button"
                onClick={() =>
                  setCurrentStep(
                    (previous) =>
                      previous + 1
                  )
                }
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            )}

             {/* SAVE */}

              {currentStep ===
                steps.length && (
                <div className="flex items-center gap-3">
                  {/* SAVE AS DRAFT (published courses only) */}

                  {courseStatus === "published" && (
                    <button
                      type="button"
                      onClick={
                        handleSaveDraft
                      }
                      disabled={saving}
                      className="rounded-xl border border-indigo-300 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : "Save as Draft"}
                    </button>
                  )}

                  {/* SAVE CHANGES */}

                  <button
                    type="button"
                    onClick={
                      handleSaveChanges
                    }
                    disabled={saving}
                    className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              )}

          </div>

        </div>

      </div>

    </main>
  );
}