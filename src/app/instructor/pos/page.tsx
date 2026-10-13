"use client";

import Link from "next/link";
import { useState } from "react";

import { usePosAnalytics } from "@/hooks/usePosAnalytics";
import { useMonthlyPosAnalytics } from "@/hooks/useMonthlyPosAnalytics";
import {
  MonthlyProgressLineChart,
  ChartCard,
} from "@/components/charts/MonthlyProgressChart";

const statIcons = {
  students: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  enrollments: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 6a2 2 0 012-2h1l1.724-2.586a1 1 0 011.636 0L14 4h5a2 2 0 011.995 1.835l-1.73 9.297A2 2 0 0118 16H6a2 2 0 01-1.995 1.835L3 23m0-13.5V12m0 0l-2-2m2 2l2 2"
      />
    </svg>
  ),
  courses: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  revenue: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c3.309 0 6 2.691 6 6v2a2 2 0 01-2 2H8a2 2 0 01-2-2v-2c0-3.309 2.691-6 6-6z"
      />
    </svg>
  ),
};

const statColors = {
  students: "bg-indigo-50 text-indigo-600",
  enrollments: "bg-purple-50 text-purple-600",
  courses: "bg-amber-50 text-amber-600",
  revenue: "bg-emerald-50 text-emerald-600",
};

export default function PosAnalyticsPage() {
  const { posData, loading, error, refetch } = usePosAnalytics();
  const { data: monthlyData, loading: monthlyLoading, error: monthlyError } =
    useMonthlyPosAnalytics();

  const [selectedMetric, setSelectedMetric] = useState<"enrollments" | "revenue">(
    "enrollments",
  );

  const { uniqueStudents, totalEnrollments, courseEnrollments } = posData;

  const totalCourses = courseEnrollments.length;
  const totalRevenue = courseEnrollments.reduce(
    (acc, course) => acc + (course.price ?? 0) * course.enrollmentCount,
    0,
  );

  const stats = [
    {
      label: "Total Students",
      value: loading ? "..." : uniqueStudents,
      icon: statIcons.students,
      color: statColors.students,
      loading,
    },
    {
      label: "Total Enrollments",
      value: loading ? "..." : totalEnrollments,
      icon: statIcons.enrollments,
      color: statColors.enrollments,
      loading,
    },
    {
      label: "Courses with Enrollments",
      value: loading ? "..." : totalCourses,
      icon: statIcons.courses,
      color: statColors.courses,
      loading,
    },
    {
      label: "Total Revenue",
      value: loading ? "..." : `₹${totalRevenue.toLocaleString()}`,
      icon: statIcons.revenue,
      color: statColors.revenue,
      loading,
    },
  ];

  const hasEnrollmentData = courseEnrollments.length > 0;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
              Instructor
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              POS Analytics
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track your course enrollments, students, and revenue performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h5m11-5v5h-5M4 12a8 8 0 1116 0 8 8 0 01-16 0z"
                />
              </svg>
              Refresh
            </button>

            <Link
              href="/instructor"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-md hover:-translate-y-0.5 ${
              stat.loading ? "animate-pulse" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
              >
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-slate-500">
                {stat.label}
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Progress Chart */}
      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="Monthly Progress"
          description={
            selectedMetric === "enrollments"
              ? "Track enrollment trends over the past 12 months"
              : "Track revenue trends over the past 12 months"
          }
          action={
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setSelectedMetric("enrollments")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedMetric === "enrollments"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Enrollments
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetric("revenue")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedMetric === "revenue"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Revenue
              </button>
            </div>
          }
        >
          {monthlyLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="space-y-3 w-full max-w-md">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 w-full rounded-xl bg-slate-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : monthlyError ? (
            <div className="h-72 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <svg
                  className="mx-auto mb-3 h-10 w-10 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm">{monthlyError}</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="h-72 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <svg
                  className="mx-auto mb-3 h-10 w-10 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-sm">No monthly data available yet</p>
              </div>
            </div>
          ) : (
            <MonthlyProgressLineChart
              data={monthlyData}
              metric={selectedMetric}
            />
          )}
        </ChartCard>

        <ChartCard
          title={selectedMetric === "enrollments" ? "Enrollment Summary" : "Revenue Summary"}
          description="Key metrics for the selected period"
        >
          <div className="h-72 flex flex-col justify-center space-y-4">
            {monthlyData.length > 0 && !monthlyLoading && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {monthlyData.reduce(
                        (acc, d) => acc + d[selectedMetric],
                        0,
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Total
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {(
                        monthlyData.reduce(
                          (acc, d) => acc + d[selectedMetric],
                          0,
                        ) / monthlyData.length
                      ).toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Monthly Avg
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {Math.max(...monthlyData.map((d) => d[selectedMetric])).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Peak Month
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border border-indigo-100">
                  <p className="text-sm font-medium text-indigo-800">
                    {selectedMetric === "enrollments" ? (
                      <>
                        <span className="font-bold text-indigo-900">
                          {monthlyData[monthlyData.length - 1].enrollments.toLocaleString()}
                        </span>{" "}
                        enrollments this month
                        {monthlyData.length > 1 && monthlyData[monthlyData.length - 2].enrollments > 0 && (
                          <>
                            {" ("}
                            {monthlyData[monthlyData.length - 1].enrollments >
                            monthlyData[monthlyData.length - 2].enrollments ? (
                              <span className="text-green-600">
                                {"↑"}
                                {(
                                  ((monthlyData[monthlyData.length - 1].enrollments -
                                    monthlyData[monthlyData.length - 2].enrollments) /
                                    monthlyData[monthlyData.length - 2].enrollments) *
                                  100
                                ).toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-red-600">
                                {"↓"}
                                {(
                                  ((monthlyData[monthlyData.length - 2].enrollments -
                                    monthlyData[monthlyData.length - 1].enrollments) /
                                    monthlyData[monthlyData.length - 2].enrollments) *
                                  100
                                ).toFixed(1)}%
                              </span>
                            )}
                            {" vs last month)"}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-emerald-900">
                          ₹{monthlyData[monthlyData.length - 1].revenue.toLocaleString()}
                        </span>{" "}
                        revenue this month
                        {monthlyData.length > 1 && monthlyData[monthlyData.length - 2].revenue > 0 && (
                          <>
                            {" ("}
                            {monthlyData[monthlyData.length - 1].revenue >
                            monthlyData[monthlyData.length - 2].revenue ? (
                              <span className="text-green-600">
                                {"↑"}
                                {(
                                  ((monthlyData[monthlyData.length - 1].revenue -
                                    monthlyData[monthlyData.length - 2].revenue) /
                                    monthlyData[monthlyData.length - 2].revenue) *
                                  100
                                ).toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-red-600">
                                {"↓"}
                                {(
                                  ((monthlyData[monthlyData.length - 2].revenue -
                                    monthlyData[monthlyData.length - 1].revenue) /
                                    monthlyData[monthlyData.length - 2].revenue) *
                                  100
                                ).toFixed(1)}%
                              </span>
                            )}
                            {" vs last month)"}
                          </>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </>
            )}
            {(monthlyLoading || monthlyData.length === 0) && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-slate-400">
                  <svg
                    className="mx-auto mb-3 h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-sm">
                    {monthlyLoading ? "Loading summary..." : "No data available"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Course Enrollment Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Section Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">
            Course Enrollment Breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            A detailed look at student distribution across your courses
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 w-full rounded-xl bg-slate-200 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : !hasEnrollmentData ? (
          /* Empty State */
          <div className="p-14 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <svg
                className="h-8 w-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              No enrollment data available
            </h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              You don&apos;t have any courses with enrollments yet. Publish a
              course to start tracking student activity here.
            </p>
            <Link
              href="/instructor/courses/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create a New Course
            </Link>
          </div>
        ) : (
          /* Course Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                    Price
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                    Enrollments
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Distribution
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {courseEnrollments.map((course) => {
                  const percentage =
                    totalEnrollments > 0
                      ? Math.round(
                          (course.enrollmentCount / totalEnrollments) * 100,
                        )
                      : 0;

                  const barWidth =
                    totalEnrollments > 0
                      ? Math.max(
                          (course.enrollmentCount / totalEnrollments) * 100,
                          4,
                        )
                      : 0;

                  const levelColor =
                    course.level === "beginner"
                      ? "bg-green-100 text-green-700"
                      : course.level === "intermediate"
                        ? "bg-blue-100 text-blue-700"
                        : course.level === "advanced"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-700";

                  const statusColor =
                    course.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700";

                  return (
                    <tr
                      key={course.courseId}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Course */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {course.title}
                            </p>
                            <p className="text-sm text-slate-500">
                              Course #{course.courseId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${levelColor}`}
                        >
                          {course.level ?? "N/A"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColor}`}
                        >
                          {course.status}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 align-top">
                        <p className="text-right font-semibold text-slate-900">
                          ₹{course.price?.toLocaleString() ?? "0"}
                        </p>
                      </td>

                      {/* Enrollments */}
                      <td className="px-6 py-4 align-top">
                        <p className="text-right font-semibold text-slate-900">
                          {course.enrollmentCount}
                        </p>
                        <p className="text-right text-xs text-slate-500">
                          {percentage}% of students
                        </p>
                      </td>

                      {/* Distribution Bar */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-24 min-w-[6rem] rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-600"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600">
                            {percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
