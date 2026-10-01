"use client";

import { useAuth } from "@/hooks/useAuth";

const courses = [
  {
    id: 1,
    title: "Web Development",
    description:
      "Learn HTML, CSS and JavaScript from the fundamentals.",
    category: "Development",
    progress: 65,
  },
  {
    id: 2,
    title: "React for Beginners",
    description:
      "Build modern interactive applications using React.",
    category: "Development",
    progress: 35,
  },
  {
    id: 3,
    title: "Database Fundamentals",
    description:
      "Understand databases, SQL and relational data.",
    category: "Database",
    progress: 80,
  },
  {
    id: 4,
    title: "UI/UX Design",
    description:
      "Learn the fundamentals of designing better user experiences.",
    category: "Design",
    progress: 20,
  },
];

export default function CoursesPage() {
  const {
    user,
    authLoading,
    logout,
  } = useAuth();

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              LearnHub
            </h1>
          </div>

          <div className="flex items-center gap-5">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                Student
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}
        <div className="mb-10">
          <p className="text-sm font-medium text-indigo-600">
            Student Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user.name}
          </h2>

          <p className="mt-2 text-slate-500">
            Continue learning and keep building your skills.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Enrolled Courses
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              4
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Courses Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              1
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Learning Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              50%
            </p>
          </div>

        </div>

        {/* Course heading */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              My Courses
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Continue where you left off.
            </p>
          </div>

          <button
            type="button"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all
          </button>
        </div>

        {/* Courses */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {courses.map((course) => (
            <div
              key={course.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >

              {/* Course image placeholder */}
              <div className="flex h-40 items-center justify-center bg-slate-100">
                <span className="text-5xl">
                  📚
                </span>
              </div>

              <div className="p-5">

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                  {course.category}
                </span>

                <h4 className="mt-4 text-lg font-bold text-slate-900">
                  {course.title}
                </h4>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {course.description}
                </p>

                {/* Progress */}
                <div className="mt-5">

                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-500">
                      Progress
                    </span>

                    <span className="font-semibold text-slate-700">
                      {course.progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{
                        width: `${course.progress}%`,
                      }}
                    />
                  </div>

                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Continue Learning
                </button>

              </div>
            </div>
          ))}

        </div>

      </section>
    </main>
  );
}


// import CourseForm from "@/components/CourseForm";


// export default function CoursesPage() {
//   return (
//     <main className="p-10">
//       <CourseForm />
//     </main>
//   );
// }