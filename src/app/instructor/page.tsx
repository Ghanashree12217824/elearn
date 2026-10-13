"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCourses } from "@/hooks/useCourses";
import { useInstructorDashboard } from "@/hooks/useInstructorDashboard";

const statIcons = {
  courses: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  published: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  drafts: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  students: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

const statColors = {
  courses: "bg-indigo-50 text-indigo-600",
  published: "bg-green-50 text-green-600",
  drafts: "bg-yellow-50 text-yellow-600",
  students: "bg-blue-50 text-blue-600",
};

const quickActions = [
  {
    label: "Create New Course",
    description: "Build a new course from scratch",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    href: "/instructor/courses/create",
    primary: true,
    color: "bg-white/10",
  },
  {
    label: "View Drafts",
    description: "Continue working on saved drafts",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: "/instructor/drafts",
    primary: false,
    color: "bg-indigo-500/20",
  },
  {
    label: "Browse Catalog",
    description: "See all published courses",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    href: "/",
    primary: false,
    color: "bg-indigo-500/20",
  },
];

export default function InstructorDashboard() {
  const router = useRouter();

  const { courses, loading, error } = useCourses();

  const {
    dashboard,
    loading: dashboardLoading,
    error: dashboardError,
  } = useInstructorDashboard();

  const filteredCourses = courses.filter((course) => !course.isDraft);

  const stats = [
    {
      label: "Total Courses",
      value: dashboardLoading ? "..." : dashboard.totalCourses,
      icon: statIcons.courses,
      color: statColors.courses,
      loading: dashboardLoading,
    },
    {
      label: "Published",
      value: dashboardLoading ? "..." : dashboard.publishedCourses,
      icon: statIcons.published,
      color: statColors.published,
      loading: dashboardLoading,
    },
    {
      label: "Drafts",
      value: dashboardLoading ? "..." : dashboard.draftCourses,
      icon: statIcons.drafts,
      color: statColors.drafts,
      loading: dashboardLoading,
    },
    {
      label: "Students",
      value: dashboardLoading ? "..." : dashboard.students,
      icon: statIcons.students,
      color: statColors.students,
      loading: dashboardLoading,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Instructor</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Manage your courses and track your students</p>
          </div>
          <div className="flex items-center gap-3">
            {quickActions.slice(0, 2).map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  action.primary
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className={action.color}>{action.icon}</span>
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                action.primary
                  ? "bg-white text-indigo-600 hover:bg-indigo-50"
                  : "bg-indigo-500/20 text-white hover:bg-indigo-500/30 border border-indigo-400/30"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">{action.icon}</span>
              <span>{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-md hover:-translate-y-0.5 ${
              stat.loading ? "animate-pulse" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-slate-500">{stat.label}</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Dashboard Error */}
      {dashboardError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {dashboardError}
        </div>
      )}

      {/* Your Courses Section */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Courses</h2>
            <p className="mt-1 text-sm text-slate-500">
              Published courses are shown below. <a href="/instructor/drafts" className="font-medium text-indigo-600 hover:text-indigo-700 underline">Manage drafts →</a>
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white animate-pulse">
                  <div className="h-44 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/2 mt-4" />
                    <div className="h-10 bg-slate-200 rounded w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          /* Empty State */
          <div className="p-14 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <svg className="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No published courses yet</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Start creating your first course and share your knowledge with students.
            </p>
            <Link
              href="/instructor/courses/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Course
            </Link>
          </div>
        ) : (
          /* Courses Grid */
          <div className="p-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => {
                let thumbnailUrl = "";

                if (typeof course.thumbnail === "string") {
                  try {
                    const parsedThumbnail = JSON.parse(course.thumbnail);
                    thumbnailUrl = parsedThumbnail?.url ?? "";
                  } catch {
                    thumbnailUrl = course.thumbnail;
                  }
                } else {
                  thumbnailUrl = course.thumbnail?.url ?? "";
                }

                const statusColor =
                  course.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700";

                return (
                  <article
                    key={course.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-44 bg-slate-100">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={course.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
                          {course.status}
                        </span>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-5 flex flex-col h-[calc(100%-176px)]">
                      <h3 className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h3>

                      <p className="mt-3 line-clamp-2 text-sm text-slate-500 flex-1">
                        {course.description || "No description available."}
                      </p>

                      {/* Enrollment Count */}
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-medium">{course.enrollmentCount ?? 0}</span>
                        <span className="text-slate-500">{(course.enrollmentCount ?? 0) === 1 ? "student" : "students"}</span>
                      </div>

                      {/* Course Details */}
                      <div className="mt-3 flex items-center justify-between text-sm border-t border-slate-100 pt-4">
                        <span className="font-semibold text-slate-900">
                          ₹{course.price ?? 0}
                        </span>
                        <span className="capitalize text-slate-500 flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          {course.level ?? "Beginner"}
                        </span>
                      </div>

                      {/* Updated */}
                      {course.updatedAt && (
                        <div className="mt-3 text-xs text-slate-500">
                          Updated{" "}
                          {new Date(course.updatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}