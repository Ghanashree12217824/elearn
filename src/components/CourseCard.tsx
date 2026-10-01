import type { CourseResource } from "@/types/course";

type CourseCardProps = {
  course: CourseResource;
};

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

export default function CourseCard({
  course,
}: CourseCardProps) {
  const thumbnailUrl = getThumbnailUrl(course.thumbnail);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No thumbnail
          </div>
        )}

        {/* Price */}
        <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-900 shadow-sm">
          ₹{course.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-2">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900">
          {course.title}
        </h2>

        {/* Instructor */}
        <p className="mt-2 text-sm text-slate-500">
          By{" "}
          <span className="font-medium text-slate-700">
            {course.instructor.name}
          </span>
        </p>

        {/* Course information */}
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
          <span>
            {course.modules.length} Modules
          </span>

          <span>•</span>

          <span>
            {course.modules.reduce(
              (total, module) =>
                total + module.lessons.length,
              0
            )}{" "}
            Lessons
          </span>
        </div>

        {/* Bottom */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

          <div>
            <p className="text-xs text-slate-400">
              Course
            </p>

            <p className="font-bold text-slate-900">
              ₹{course.price}
            </p>
          </div>

          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            View Course
          </button>

        </div>

      </div>
    </article>
  );
}