"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useProgress } from "@/hooks/useProgress";
import type { CourseResource } from "@/types/course";

function getThumbnailUrl(thumbnail: CourseResource["thumbnail"]): string {
  if (typeof thumbnail === "string") {
    try {
      const parsed = JSON.parse(thumbnail);
      return parsed?.url ?? "";
    } catch {
      return thumbnail;
    }
  }

  return (thumbnail as { url?: string } | null)?.url ?? "";
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [progressUpdateLoading, setProgressUpdateLoading] = useState<number | null>(null);

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { getLessonCompleted, markLessonComplete } = useProgress();

  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseId}`);

        if (!response.ok) {
          setError("Course not found");
          return;
        }

        const data = await response.json();
        setCourse(data.data);
      } catch {
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  // Check enrollment status
  useEffect(() => {
    async function checkEnrollment() {
      if (!user || !course) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        const response = await fetch("/api/enrollments");
        if (response.ok) {
          const data = await response.json();
          const enrollments = data.data || [];
          const alreadyEnrolled = enrollments.some(
            (e: { id: number; enrollmentStatus: string }) =>
              e.id === course.id && e.enrollmentStatus === "active"
          );
          setIsEnrolled(alreadyEnrolled);
        }
      } catch {
        // Ignore errors
      } finally {
        setCheckingEnrollment(false);
      }
    }

    checkEnrollment();
  }, [user, course]);

  const handleEnroll = async () => {
    if (!user || !course) return;

    setIsEnrolling(true);
    setEnrollError("");

    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEnrollError(data.message || "Failed to enroll");
        return;
      }

      setIsEnrolled(true);
    } catch {
      setEnrollError("Something went wrong. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading || checkingEnrollment) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">{error || "Course not found"}</h1>
          <Link
            href="/"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const thumbnailUrl = getThumbnailUrl(course.thumbnail);
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Browse Catalog
      </Link>

      {/* Hero Image */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-slate-100 mb-8">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No thumbnail
          </div>
        )}

        {/* Price badge */}
        <div className="absolute right-6 top-6 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-slate-900 shadow-sm">
          {course.price === 0 ? "Free" : `₹${course.price}`}
        </div>
      </div>

      {/* Course Info */}
      <div className="space-y-6">

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {course.tags.slice(0, 5).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Title & Instructor */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              {course.title}
            </h1>
            <p className="mt-2 text-slate-600">
              By{" "}
              <span className="font-medium text-slate-900">
                {course.instructor.name}
              </span>
            </p>
          </div>

          {user && (
            <button
              type="button"
              onClick={async () => {
                if (bookmarkLoading) return;
                setBookmarkLoading(true);
                await toggleBookmark(course.id);
                setBookmarkLoading(false);
              }}
              disabled={bookmarkLoading}
              className={`rounded-full bg-white p-3 shadow-sm transition hover:bg-slate-100 disabled:opacity-50 ${isBookmarked(course.id) ? "text-indigo-600" : "text-slate-600"}`}
              aria-label={isBookmarked(course.id) ? "Remove bookmark" : "Bookmark course"}
              title={isBookmarked(course.id) ? "Remove bookmark" : "Bookmark course"}
            >
              {isBookmarked(course.id) ? (
                <svg className="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-t border-b border-slate-200 py-4">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H11a2 2 0 00-2 2v10z" />
            </svg>
            {course.modules.length} Modules
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {totalLessons} Lessons
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.level}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7c0-.512.195-1.024.586-1.414L11 1.586A2 2 0 0112.414 1H17c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7-7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7z" />
            </svg>
            {course.status}
          </span>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">About this course</h2>
          <p className="mt-3 text-slate-600 leading-relaxed whitespace-pre-line">
            {course.description || "No description available."}
          </p>
        </div>

        {/* Progress Summary (visible when enrolled) */}
        {user && isEnrolled && (() => {
          const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
          const completedLessons = course.modules.reduce(
            (acc, m) => acc + m.lessons.filter((l) => getLessonCompleted(l.id)).length,
            0
          );
          const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          return (
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Your Progress</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {completedLessons} of {totalLessons} lessons completed
                  </span>
                  <span className="font-semibold text-slate-700">{percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Curriculum */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">Course Content</h2>
          <div className="mt-4 space-y-4">
            {course.modules.map((module, moduleIndex) => (
              <div key={module.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">
                      Module {moduleIndex + 1}: {module.name}
                    </h3>
                    <span className="text-sm text-slate-500">
                      {module.lessons.length} lessons
                    </span>
                  </div>
                </div>
                 <ul className="divide-y divide-slate-100">
                   {module.lessons.map((lesson, lessonIndex) => {
                     const isLessonCompleted = getLessonCompleted(lesson.id);
                     return (
                       <li key={lesson.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50">
                         <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-700 flex-shrink-0">
                           {lessonIndex + 1}
                         </span>
                         <span className="text-slate-700">{lesson.name}</span>

                         {lesson.videoUrls.length > 0 && (
                           <span className="ml-auto text-xs text-slate-400 flex items-center gap-1">
                             <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                             </svg>
                             Video
                           </span>
                         )}

                         {user && isEnrolled && (
                           <button
                             type="button"
                             onClick={async () => {
                               if (progressUpdateLoading) return;
                               setProgressUpdateLoading(lesson.id);
                               await markLessonComplete(course.id, lesson.id, !isLessonCompleted);
                               setProgressUpdateLoading(null);
                             }}
                             disabled={progressUpdateLoading === lesson.id}
                             className={`flex-shrink-0 rounded-lg p-1.5 transition ${
                               isLessonCompleted
                                 ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                                 : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                             } disabled:opacity-50`}
                             aria-label={isLessonCompleted ? "Mark as incomplete" : "Mark as complete"}
                             title={isLessonCompleted ? "Mark as incomplete" : "Mark as complete"}
                           >
                             {progressUpdateLoading === lesson.id ? (
                               <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                               </svg>
                             ) : isLessonCompleted ? (
                               <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                               </svg>
                             ) : (
                               <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75v1.5m0 0v1.5m0-1.5h1.5m-1.5 0H9z" />
                               </svg>
                             )}
                           </button>
                         )}
                       </li>
                     );
                   })}
                 </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment Action */}
        <div className="border-t border-slate-200 pt-6">
          {user ? (
            isEnrolled ? (
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-green-800">You&apos;re enrolled!</p>
                  <p className="text-sm text-green-600">Start learning from the course content above.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="flex-1 rounded-xl bg-indigo-600 px-6 py-3.5 text-lg font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnrolling ? "Enrolling..." : course.price === 0 ? "Enroll for Free" : `Enroll for ₹${course.price}`}
                </button>
                {enrollError && (
                  <p className="text-sm text-red-600" role="alert">
                    {enrollError}
                  </p>
                )}
              </div>
            )
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-slate-600">
                <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-700">
                  Sign in
                </Link>{" "}
                to enroll in this course.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}