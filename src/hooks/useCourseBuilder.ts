"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  CourseBuilderDraft,
  CourseBuilderCourse,
  CourseBuilderModule,
  CourseBuilderLesson,
  LessonContent,
  LessonResource,
} from "@/types/course-builder";

const initialCourse: CourseBuilderDraft = {
  course: {
    id: null,
    title: "",
    description: "",
    thumbnail: null,
    category: null,
    instructor: null,
    price: 0,
    level: "beginner",
    tags: [],
  },
  modules: [],
};

interface UseCourseBuilderOptions {
  autoSave?: boolean;
}

export function useCourseBuilder(
  { autoSave = false }: UseCourseBuilderOptions = {}
) {
  const [course, setCourse] =
    useState<CourseBuilderDraft>(initialCourse);

  const [thumbnailFile, setThumbnailFileState] =
    useState<File | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [completionPct, setCompletionPct] = useState(0);
  const [courseCode, setCourseCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let code = localStorage.getItem("courseBuilderCourseCode");
      if (!code) {
        code = crypto.randomUUID();
        localStorage.setItem("courseBuilderCourseCode", code);
      }
      return code;
    }
    return crypto.randomUUID();
  });

  const [draftLoading, setDraftLoading] =
    useState(false);

  const [draftError, setDraftError] =
    useState("");

  const [publishLoading, setPublishLoading] =
    useState(false);

  const [publishError, setPublishError] =
    useState<string | null>(null);

  // =========================================================
  // AUTO SAVE
  // =========================================================

  const autoSaveTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const skipNextAutoSaveRef =
    useRef(false);

  const hasMountedRef =
    useRef(false);

  const [autoSaveStatus, setAutoSaveStatus] =
    useState<"idle" | "saving" | "saved" | "error">(
      "idle"
    );

  // =========================================================
  // COURSE
  // =========================================================

  function updateCourse(
    data: Partial<CourseBuilderCourse>
  ) {
    setCourse((previous) => ({
      ...previous,

      course: {
        ...previous.course,
        ...data,
      },
    }));
  }

  function setThumbnailFile(file: File | null) {
    setThumbnailFileState(file);
  }

  // =========================================================
  // LOAD EXISTING COURSE
  // =========================================================

  const loadCourse = useCallback(
    (data: CourseBuilderDraft) => {
      /*
       * Prevent the loaded course from immediately
       * triggering the auto-save timer.
       */
      skipNextAutoSaveRef.current = true;

      setCourse(data);

      // Existing course thumbnail is already stored
      // on the server.
      setThumbnailFileState(null);

      setDraftError("");
      setPublishError(null);
      setAutoSaveStatus("idle");
    },
    []
  );

  // =========================================================
  // MODULES
  // =========================================================

  function addModule(
    module: CourseBuilderModule
  ) {
    setCourse((previous) => ({
      ...previous,

      modules: [
        ...previous.modules,
        module,
      ],
    }));
  }

  function updateModule(
    moduleId: number,
    data: Partial<CourseBuilderModule>
  ) {
    setCourse((previous) => ({
      ...previous,

      modules: previous.modules.map(
        (module) =>
          module.id === moduleId
            ? {
                ...module,
                ...data,
              }
            : module
      ),
    }));
  }

  function removeModule(
    moduleId: number
  ) {
    setCourse((previous) => ({
      ...previous,

      modules: previous.modules.filter(
        (module) =>
          module.id !== moduleId
      ),
    }));
  }

  // =========================================================
  // LESSONS
  // =========================================================

  function addLesson(
    moduleId: number,
    lesson: CourseBuilderLesson
  ) {
    setCourse((previous) => ({
      ...previous,

      modules: previous.modules.map(
        (module) =>
          module.id === moduleId
            ? {
                ...module,

                lessons: [
                  ...module.lessons,
                  lesson,
                ],
              }
            : module
      ),
    }));
  }

  function updateLesson(
    moduleId: number,
    lessonId: number,
    data: Partial<CourseBuilderLesson>
  ) {
    setCourse((previous) => ({
      ...previous,

      modules: previous.modules.map(
        (module) =>
          module.id === moduleId
            ? {
                ...module,

                lessons:
                  module.lessons.map(
                    (lesson) =>
                      lesson.id === lessonId
                        ? {
                            ...lesson,
                            ...data,
                          }
                        : lesson
                  ),
              }
            : module
      ),
    }));
  }

  function removeLesson(
    moduleId: number,
    lessonId: number
  ) {
    setCourse((previous) => ({
      ...previous,

      modules: previous.modules.map(
        (module) =>
          module.id === moduleId
            ? {
                ...module,

                lessons:
                  module.lessons.filter(
                    (lesson) =>
                      lesson.id !== lessonId
                  ),
              }
            : module
      ),
    }));
  }

  // =========================================================
  // LESSON CONTENT
  // =========================================================

  function setLessonContent(
    moduleId: number,
    lessonId: number,
    content: LessonContent
  ) {
    setCourse((previous) => ({
      ...previous,

      modules: previous.modules.map(
        (module) =>
          module.id === moduleId
            ? {
                ...module,

                lessons:
                  module.lessons.map(
                    (lesson) =>
                      lesson.id === lessonId
                        ? {
                            ...lesson,
                            content,
                          }
                        : lesson
                  ),
              }
            : module
      ),
    }));
  }

  // =========================================================
  // RESOURCES
  // =========================================================

  function addResource(
    moduleId: number,
    lessonId: number,
    resource: LessonResource
  ) {
    setCourse((previous) => ({
      ...previous,

      modules: previous.modules.map(
        (module) =>
          module.id === moduleId
            ? {
                ...module,

                lessons:
                  module.lessons.map(
                    (lesson) =>
                      lesson.id === lessonId
                        ? {
                            ...lesson,

                            resources: [
                              ...lesson.resources,
                              resource,
                            ],
                          }
                        : lesson
                  ),
              }
            : module
      ),
    }));
  }

  function removeResource(
    moduleId: number,
    lessonId: number,
    resourceId: number
  ) {
    setCourse((previous) => ({
      ...previous,

      modules: previous.modules.map(
        (module) =>
          module.id === moduleId
            ? {
                ...module,

                lessons:
                  module.lessons.map(
                    (lesson) =>
                      lesson.id === lessonId
                        ? {
                            ...lesson,

                            resources:
                              lesson.resources.filter(
                                (resource) =>
                                  resource.id !==
                                  resourceId
                              ),
                          }
                        : lesson
                  ),
              }
            : module
      ),
    }));
  }

   // =========================================================
   // SAVE AS DRAFT (pending changes for published course)
   // =========================================================

   const saveAsDraft = useCallback(
     async (sourceCourseId: number) => {
       setDraftLoading(true);
       setDraftError("");
       setAutoSaveStatus("saving");

       try {
         const formData = new FormData();

         formData.append(
           "draftData",
           JSON.stringify(course)
         );

         if (thumbnailFile) {
           formData.append(
             "thumbnail",
             thumbnailFile
           );
         }

         /*
          * Link this draft to the published source course.
          * The API uses sourceCourseId for deduplication
          * (updating the same pending-draft across sessions)
          * instead of the courseCode used by the create flow.
          */
         formData.append(
           "sourceCourseId",
           String(sourceCourseId)
         );

         formData.append(
           "currentStep",
           String(currentStep)
         );

         formData.append(
           "completionPct",
           String(completionPct)
         );

         formData.append(
           "status",
           "active"
         );

         const response = await fetch(
           "/api/course-builder/draft",
           {
             method: "POST",
             body: formData,
           }
         );

         const data =
           await response.json();

         if (!response.ok) {
           const message =
             data.message ||
             "Failed to save course draft.";

           setDraftError(message);
           setAutoSaveStatus("error");

           return {
             success: false,
           };
         }

         setAutoSaveStatus("saved");

         return {
           success: true,
           draftId: data.draftId,
           sourceCourseId:
             data.sourceCourseId,
         };
       } catch (error) {
         console.error(error);

         setDraftError(
           "Something went wrong while saving the draft."
         );

         setAutoSaveStatus("error");

         return {
           success: false,
         };
       } finally {
         setDraftLoading(false);
       }
     },
     [course, thumbnailFile, currentStep, completionPct]
   );

   // =========================================================
   // SAVE DRAFT
   // =========================================================

   const saveDraft = useCallback(
    async (options?: { status?: "active" | "completed" }) => {
      setDraftLoading(true);
      setDraftError("");
      setAutoSaveStatus("saving");

      try {
        const formData = new FormData();

        formData.append(
          "draftData",
          JSON.stringify(course)
        );

        if (thumbnailFile) {
          formData.append(
            "thumbnail",
            thumbnailFile
          );
        }

        // Include courseCode and progress metadata
        formData.append("courseCode", courseCode);
        formData.append("currentStep", String(currentStep));
        formData.append("completionPct", String(completionPct));
        formData.append("status", options?.status || "active");

        const response = await fetch(
          "/api/course-builder/draft",
          {
            method: "POST",
            body: formData,
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          const message =
            data.message ||
            "Failed to save course draft.";

          setDraftError(message);
          setAutoSaveStatus("error");

          return { success: false, courseCode: null };
        }

        setAutoSaveStatus("saved");

        return { success: true, courseCode: data.uuid || courseCode };
      } catch (error) {
        console.error(error);

        setDraftError(
          "Something went wrong while saving the draft."
        );

        setAutoSaveStatus("error");

        return { success: false, courseCode: null };
      } finally {
        setDraftLoading(false);
      }
    },
    [course, thumbnailFile, courseCode, currentStep, completionPct]
  );

  // =========================================================
  // 5 SECOND AUTO SAVE
  // =========================================================

  useEffect(() => {
    // Auto-save is only enabled for pages that
    // explicitly request it.
    if (!autoSave) {
      return;
    }

    // Skip the first render.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    // Do not auto-save when loading an existing
    // course/draft into the builder.
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }

    // Clear previous timer.
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setAutoSaveStatus("idle");

    // Start a new 5-second timer.
    autoSaveTimerRef.current =
      setTimeout(() => {
        void saveDraft();
      }, 5000);

    // Cleanup timer.
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(
          autoSaveTimerRef.current
        );

        autoSaveTimerRef.current = null;
      }
    };
  }, [
    autoSave,
    course,
    thumbnailFile,
    saveDraft,
  ]);

  // =========================================================
  // LOAD DRAFT
  // =========================================================

  const loadDraft = useCallback(
    async () => {
      setDraftLoading(true);
      setDraftError("");

      try {
        const response = await fetch(
          "/api/course-builder/draft"
        );

        const data =
          await response.json();

        if (!response.ok) {
          setDraftError(
            data.message ||
              "Failed to load course draft."
          );

          return false;
        }

        if (!data.drafts || data.drafts.length === 0) {
          skipNextAutoSaveRef.current = true;

          setCourse(initialCourse);

          setThumbnailFileState(null);

          setAutoSaveStatus("idle");

          return false;
        }

        /*
         * Load the most recent draft (first in array)
         * to maintain backward compatibility.
         */
        const latestDraft = data.drafts[0];

        /*
         * Prevent the loaded draft from triggering
         * another auto-save.
         */
        skipNextAutoSaveRef.current = true;

        setCourse(
          latestDraft.draftData
        );

        /*
         * The thumbnail already exists on the
         * server when loading a saved draft.
         */
        setThumbnailFileState(null);

        setAutoSaveStatus("saved");

        return true;
      } catch (error) {
        console.error(error);

        setDraftError(
          "Something went wrong while loading the draft."
        );

        return false;
      } finally {
        setDraftLoading(false);
      }
    },
    []
  );

  // =========================================================
  // PUBLISH
  // =========================================================

  const publishCourse = useCallback(
    async () => {
      try {
        setPublishLoading(true);
        setPublishError(null);

        // Save latest builder state first.
        const draftFormData =
          new FormData();

        draftFormData.append(
          "draftData",
          JSON.stringify(course)
        );

        if (thumbnailFile) {
          draftFormData.append(
            "thumbnail",
            thumbnailFile
          );
        }

        const draftResponse =
          await fetch(
            "/api/course-builder/draft",
            {
              method: "POST",
              body: draftFormData,
            }
          );

        const draftData =
          await draftResponse.json();

        if (!draftResponse.ok) {
          throw new Error(
            draftData.message ||
              "Failed to save course before publishing."
          );
        }

        // Publish.
        const publishFormData =
          new FormData();

        if (thumbnailFile) {
          publishFormData.append(
            "thumbnail",
            thumbnailFile
          );
        }

        const response =
          await fetch(
            "/api/course-builder/publish",
            {
              method: "POST",
              body: publishFormData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.reason ||
              data.message ||
              "Failed to publish course."
          );
        }

        setAutoSaveStatus("saved");

        return data;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to publish course.";

        setPublishError(message);

        throw error;
      } finally {
        setPublishLoading(false);
      }
    },
     [course, thumbnailFile]
   );

   // =========================================================
   // RESET
   // =========================================================

   function resetCourse() {
    if (autoSaveTimerRef.current) {
      clearTimeout(
        autoSaveTimerRef.current
      );

      autoSaveTimerRef.current = null;
    }

    skipNextAutoSaveRef.current = true;

    setCourse(initialCourse);
    setThumbnailFileState(null);

    // Clear courseCode to start fresh
    if (typeof window !== "undefined") {
      localStorage.removeItem("courseBuilderCourseCode");
      const newCode = crypto.randomUUID();
      localStorage.setItem("courseBuilderCourseCode", newCode);
      setCourseCode(newCode);
    }

    setDraftError("");
    setPublishError(null);

    setAutoSaveStatus("idle");
  }

  // =========================================================
  // RETURN
  // =========================================================

  return {
    course,

    thumbnailFile,
    setThumbnailFile,

    loadCourse,

    updateCourse,

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
     saveAsDraft,
     loadDraft,

    draftLoading,
    draftError,

    // Auto-save
    autoSaveStatus,

      publishCourse,
     publishLoading,
     publishError,

    resetCourse,

    // Progress tracking
    currentStep,
    setCurrentStep,
    completionPct,
    setCompletionPct,
    courseCode,
    setCourseCode,
  };
}