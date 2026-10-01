"use client";

import type {
  CourseBuilderDraft,
} from "@/types/course-builder";

type Props = {
  course: CourseBuilderDraft;
};

export default function ReviewStep({ course }: Props) {
  const { course: courseInfo, modules } = course;

  const totalLessons = modules.reduce(
    (total, module) =>
      total + module.lessons.length,
    0
  );

  const totalResources = modules.reduce(
    (total, module) =>
      total +
      module.lessons.reduce(
        (lessonTotal, lesson) =>
          lessonTotal + lesson.resources.length,
        0
      ),
    0
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Review Course
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Review your course information before saving
          or publishing it.
        </p>
      </div>


      {/* Course Overview */}
      <section className="overflow-hidden rounded-2xl border border-slate-200">

        {/* Thumbnail */}
        {courseInfo.thumbnail && (
          <div className="h-64 w-full bg-slate-100">
            <img
              src={courseInfo.thumbnail.url}
              alt={courseInfo.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}


        <div className="p-6">

          {/* Title */}
          <h3 className="text-2xl font-bold text-slate-900">
            {courseInfo.title || "Untitled Course"}
          </h3>


          {/* Description */}
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {courseInfo.description ||
              "No course description added."}
          </p>


          {/* Course Details */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Category
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {courseInfo.category?.title ||
                  "Not selected"}
              </p>
            </div>


            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Level
              </p>

              <p className="mt-1 font-semibold capitalize text-slate-800">
                {courseInfo.level}
              </p>
            </div>


            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Price
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                ₹{courseInfo.price}
              </p>
            </div>


            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Modules
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {modules.length}
              </p>
            </div>

          </div>


          {/* Tags */}
          <div className="mt-6">

            <p className="mb-2 text-sm font-semibold text-slate-700">
              Tags
            </p>

            {courseInfo.tags.length === 0 ? (
              <p className="text-sm text-slate-400">
                No tags added.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">

                {courseInfo.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
                  >
                    {tag.name}
                  </span>
                ))}

              </div>
            )}

          </div>

        </div>

      </section>


      {/* Course Statistics */}
      <section>

        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Course Summary
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Modules
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {modules.length}
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Lessons
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalLessons}
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Resources
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalResources}
            </p>
          </div>

        </div>

      </section>


      {/* Modules */}
      <section>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Course Content
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Review your modules, lessons and content.
          </p>
        </div>


        {modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <p className="font-medium text-slate-600">
              No modules added.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {modules.map((module, moduleIndex) => (
              <div
                key={module.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >

                {/* Module Header */}
                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                    {moduleIndex + 1}
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {module.title}
                    </h4>

                    {module.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {module.description}
                      </p>
                    )}
                  </div>

                </div>


                {/* Lessons */}
                {module.lessons.length === 0 ? (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-400">
                      No lessons added.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">

                    {module.lessons.map(
                      (lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >

                          <div className="flex items-start gap-3">

                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-600 shadow-sm">
                              {lessonIndex + 1}
                            </span>


                            <div className="min-w-0 flex-1">

                              <h5 className="font-medium text-slate-800">
                                {lesson.title}
                              </h5>

                              {lesson.description && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {lesson.description}
                                </p>
                              )}


                              {/* Content */}
                              <div className="mt-3 flex flex-wrap gap-2">

                                {lesson.content ? (
                                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium capitalize text-green-600">
                                    Content:{" "}
                                    {lesson.content.type}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                                    No main content
                                  </span>
                                )}


                                {lesson.resources.length > 0 && (
                                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                                    {lesson.resources.length}{" "}
                                    {lesson.resources.length === 1
                                      ? "resource"
                                      : "resources"}
                                  </span>
                                )}

                              </div>

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </section>


      {/* Instructor */}
      {courseInfo.instructor && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

          <h3 className="text-lg font-semibold text-slate-900">
            Instructor
          </h3>

          <div className="mt-4">

            <p className="font-semibold text-slate-800">
              {courseInfo.instructor.name}
            </p>

            {courseInfo.instructor.bio && (
              <p className="mt-1 text-sm text-slate-500">
                {courseInfo.instructor.bio}
              </p>
            )}

            {courseInfo.instructor.experience && (
              <p className="mt-2 text-sm text-slate-500">
                Experience:{" "}
                {courseInfo.instructor.experience}
              </p>
            )}

          </div>

        </section>
      )}

    </div>
  );
}