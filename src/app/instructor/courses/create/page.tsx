"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import CourseInformation from "@/app/instructor/course-builder/CourseInformation";
import ModulesStep from "@/app/instructor/course-builder/ModulesStep";
import LessonsStep from "@/app/instructor/course-builder/LessonsStep";
import ContentStep from "@/app/instructor/course-builder/ContentStep";
import ReviewStep from "@/app/instructor/course-builder/ReviewStep";

import { useCourseBuilder } from "@/hooks/useCourseBuilder";

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

function CreateCoursePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [loadingDraft, setLoadingDraft] = useState(false);

  // Get courseCode from URL (stable identifier for the draft)
  const courseCode = searchParams.get("courseCode");

  const {
    course,
    updateCourse,
    setThumbnailFile,

    addModule,
    updateModule,
    removeModule,

    addLesson,
    updateLesson,
    removeLesson,

    setLessonContent,

    addResource,
    removeResource,

    saveDraft,
    loadDraft,
    loadCourse,

    draftLoading,
    draftError,

    publishCourse,
    publishLoading,
    publishError,
    autoSaveStatus,

    resetCourse,
  } = useCourseBuilder({
    autoSave: true,
  });

  /*
   * Load specific draft when courseCode is provided in URL
   * Otherwise start with blank form for new course
   */
  useEffect(() => {
    if (courseCode) {
      async function loadSpecificDraft() {
        setLoadingDraft(true);
        try {
          const response = await fetch(`/api/course-builder/draft/${courseCode}`);
          const data = await response.json();

          if (response.ok && data.draft) {
            loadCourse(data.draft.draftData);
          }
        } catch (error) {
          console.error("Failed to load draft:", error);
        } finally {
          setLoadingDraft(false);
        }
      }
      loadSpecificDraft();
    }
  }, [courseCode, loadCourse]);

  /*
   * Move to next step
   */
  function nextStep() {
    if (currentStep < steps.length) {
      setCurrentStep((previous) => previous + 1);
    }
  }

  /*
   * Move to previous step
   */
  function previousStep() {
    if (currentStep > 1) {
      setCurrentStep((previous) => previous - 1);
    }
  }

  /*
   * Save course as draft
   */
  async function handleSaveDraft() {
    const result = await saveDraft();

    if (result.success) {
      alert("Course draft saved successfully.");
      resetCourse();
      // Redirect to create page with courseCode to continue editing the same draft
      if (result.courseCode) {
        router.push(`/instructor/courses/create?courseCode=${result.courseCode}`);
      } else {
        router.push("/instructor");
      }
    }
  }

  /*
   * Publish course
   */
  async function handlePublishCourse() {
    try {
      const result = await publishCourse();

      console.log("Published course:", result);

      alert("Course published successfully.");

      // Go back to instructor dashboard
      router.push("/instructor");
    } catch (error) {
      console.error("Publish course failed:", error);
    }
  }

  /*
   * Render current step
   */
  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <CourseInformation
            course={course.course}
            updateCourse={updateCourse}
            setThumbnailFile={setThumbnailFile}
          />
        );

      case 2:
        return (
          <ModulesStep
            modules={course.modules}
            addModule={addModule}
            updateModule={updateModule}
            removeModule={removeModule}
          />
        );

      case 3:
        return (
          <LessonsStep
            modules={course.modules}
            addLesson={addLesson}
            updateLesson={updateLesson}
            removeLesson={removeLesson}
            setLessonContent={setLessonContent}
          />
        );

      case 4:
        return (
          <ContentStep
            modules={course.modules}
            addResource={addResource}
            removeResource={removeResource}
          />
        );

      case 5:
        return <ReviewStep course={course} />;

      default:
        return null;
    }
  }

  /*
   * Loading screen when loading a specific draft
   */
  if (loadingDraft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading course draft...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* PAGE HEADER */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create Course</h1>

            <p className="mt-2 text-slate-500">Build your course step by step.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetCourse();
              router.push("/instructor/courses/create");
            }}
            className="ml-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            + New Course
          </button>
        </div>

        {/* AUTO-SAVE STATUS */}
        <div className="mt-3">
          {autoSaveStatus === "saving" && (
            <p className="text-sm text-slate-500">Saving changes...</p>
          )}

          {autoSaveStatus === "saved" && (
            <p className="text-sm text-green-600">Changes saved</p>
          )}

          {autoSaveStatus === "error" && (
            <p className="text-sm text-red-600">Failed to save changes</p>
          )}
        </div>

        {/* STEP NAVIGATION */}

        <div className="mb-8 overflow-x-auto">
          <div className="flex min-w-max items-center">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;

              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (step.id <= currentStep) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className="flex items-center gap-3"
                  >
                    {/* STEP NUMBER */}

                    <span
                      className={`
                        flex h-10 w-10 items-center
                        justify-center rounded-full
                        text-sm font-semibold
                        transition
                        ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : isCompleted
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-slate-200 text-slate-500"
                        }
                      `}
                    >
                      {isCompleted ? "✓" : step.id}
                    </span>

                    {/* STEP TITLE */}

                    <span
                      className={`
                        text-sm font-medium
                        ${
                          isActive
                            ? "text-indigo-600"
                            : isCompleted
                              ? "text-slate-700"
                              : "text-slate-500"
                        }
                      `}
                    >
                      {step.title}
                    </span>
                  </button>

                  {/* CONNECTOR */}

                  {index < steps.length - 1 && (
                    <div
                      className={`
                        mx-4 h-px w-12
                        ${
                          currentStep > step.id
                            ? "bg-indigo-400"
                            : "bg-slate-300"
                        }
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CURRENT STEP */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {renderStep()}
        </div>

        {/* DRAFT ERROR */}

        {draftError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-600">{draftError}</p>
          </div>
        )}

        {/* PUBLISH ERROR */}

        {publishError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-600">
              Publishing failed: {publishError}
            </p>
          </div>
        )}

        {/* FOOTER BUTTONS */}

        <div className="mt-6 flex items-center justify-between">
          {/* BACK */}

          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 1 || publishLoading}
            className="
              rounded-xl
              border border-slate-300
              px-5 py-2.5
              text-sm font-semibold
              text-slate-700
              transition
              hover:bg-slate-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Back
          </button>

          {/* NEXT */}

          {currentStep < steps.length && (
            <button
              type="button"
              onClick={nextStep}
              className="
                rounded-xl
                bg-indigo-600
                px-6 py-2.5
                text-sm font-semibold
                text-white
                transition
                hover:bg-indigo-700
              "
            >
              Next
            </button>
          )}

{/* FINAL ACTIONS */}

          {currentStep === steps.length && (
            <div className="flex gap-3">
              {/* SAVE DRAFT */}

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={draftLoading || publishLoading}
                className="
                  rounded-xl
                  border border-slate-300
                  px-5 py-2.5
                  text-sm font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {draftLoading ? "Saving..." : "Save as Draft"}
              </button>

              {/* PUBLISH */}

              <button
                type="button"
                onClick={handlePublishCourse}
                disabled={publishLoading}
                className="
                  rounded-xl
                  bg-indigo-600
                  px-6 py-2.5
                  text-sm font-semibold
                  text-white
                  transition
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {publishLoading ? "Publishing..." : "Publish Course"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateCoursePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" /></div>}>
      <CreateCoursePageContent />
    </Suspense>
  );
}