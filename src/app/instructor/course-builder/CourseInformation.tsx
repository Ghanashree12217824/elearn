"use client";

import { useCategories } from "@/hooks/useCategories";

import type {
  CourseBuilderCourse,
  CourseThumbnail,
} from "@/types/course-builder";

type Props = {
  course: CourseBuilderCourse;
  updateCourse: (data: Partial<CourseBuilderCourse>) => void;
  setThumbnailFile: (file: File | null) => void;
};

function parsePrice(value: string): number {
  if (!value || value.trim() === "" || value.toLowerCase() === "free") {
    return 0;
  }
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

export default function CourseInformation({
  course,
  updateCourse,
  setThumbnailFile,
}: Props) {
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  function handleThumbnailChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Thumbnail must be smaller than 5 MB.");
      return;
    }

    /*
     * Store the real File object.
     * The edit page will send this File to the API.
     */
    setThumbnailFile(file);

    /*
     * This URL is ONLY for the local preview.
     * It will NOT be stored in MySQL.
     */
    const previewUrl = URL.createObjectURL(file);

    const thumbnail: CourseThumbnail = {
      url: previewUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };

    updateCourse({
      thumbnail,
    });
  }

  function handleTagChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    const tagNames = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    updateCourse({
      tags: tagNames.map((name, index) => ({
        id: index + 1,
        name,
      })),
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Course Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add the basic information about your course.
        </p>
      </div>

      {/* Course Title */}
      <div>
        <label
          htmlFor="course-title"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Course Title
        </label>

        <input
          id="course-title"
          type="text"
          value={course.title}
          onChange={(event) =>
            updateCourse({
              title: event.target.value,
            })
          }
          placeholder="e.g. Complete Web Development"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="course-description"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Description
        </label>

        <textarea
          id="course-description"
          rows={5}
          value={course.description}
          onChange={(event) =>
            updateCourse({
              description: event.target.value,
            })
          }
          placeholder="Describe what students will learn..."
          className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Course Thumbnail
        </label>

        <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-indigo-400">
          <input
            id="course-thumbnail"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleThumbnailChange}
            className="hidden"
          />

          <label
            htmlFor="course-thumbnail"
            className="cursor-pointer"
          >
            {course.thumbnail ? (
              <div className="space-y-3">
                <img
                  src={course.thumbnail.url}
                  alt="Course thumbnail preview"
                  className="mx-auto h-40 w-full max-w-md rounded-xl object-cover"
                />

                <p className="text-sm font-medium text-slate-700">
                  {course.thumbnail.fileName}
                </p>

                <p className="text-xs text-slate-400">
                  Click to change thumbnail
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-3xl">+</div>

                <p className="text-sm font-semibold text-slate-700">
                  Upload course thumbnail
                </p>

                <p className="text-xs text-slate-400">
                  PNG, JPG or WEBP
                </p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Category + Level */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category */}
        <div>
          <label
            htmlFor="course-category"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Category
          </label>

          <select
            id="course-category"
            value={course.category?.id ?? ""}
            onChange={(event) => {
              const categoryId = Number(event.target.value);

              const selectedCategory = categories.find(
                (category) => category.id === categoryId
              );

              if (!selectedCategory) {
                updateCourse({
                  category: null,
                });

                return;
              }

              updateCourse({
                category: {
                  id: selectedCategory.id,
                  title: selectedCategory.name,
                },
              });
            }}
            disabled={categoriesLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
          >
            <option value="">
              {categoriesLoading
                ? "Loading categories..."
                : "Select category"}
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          {categoriesError && (
            <p className="mt-2 text-sm text-red-500">
              {categoriesError}
            </p>
          )}
        </div>

        {/* Level */}
        <div>
          <label
            htmlFor="course-level"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Difficulty Level
          </label>

          <select
            id="course-level"
            value={course.level}
            onChange={(event) =>
              updateCourse({
                level: event.target.value as
                  | "beginner"
                  | "intermediate"
                  | "advanced",
              })
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">
              Intermediate
            </option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Price */}
      <div>
        <label
          htmlFor="course-price"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Price
        </label>

        <input
          id="course-price"
          type="text"
          value={course.price === 0 ? "Free" : String(course.price)}
          onChange={(event) =>
            updateCourse({
              price: parsePrice(event.target.value),
            })
          }
          placeholder="Enter price or 'Free'"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="course-tags"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Tags
        </label>

        <input
          id="course-tags"
          type="text"
          value={course.tags
            .map((tag) => tag.name)
            .join(", ")}
          onChange={handleTagChange}
          placeholder="JavaScript, React, Next.js"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        <p className="mt-2 text-xs text-slate-400">
          Separate tags with commas.
        </p>
      </div>
    </div>
  );
}