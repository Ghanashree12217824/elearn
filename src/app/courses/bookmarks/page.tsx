"use client";

import Link from "next/link";
import { useBookmarks } from "@/hooks/useBookmarks";

type ThumbnailType = { url?: string } | string | null;

function getThumbnailUrl(thumbnail: ThumbnailType): string {
  if (typeof thumbnail === "string") {
    try {
      const parsed = JSON.parse(thumbnail);
      return parsed?.url ?? "";
    } catch {
      return thumbnail;
    }
  }
  return thumbnail?.url ?? "";
}

const bookmarkIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const bookmarkSolidIcon = (
  <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

export default function BookmarksPage() {
  const { bookmarks, loading, error, refetch, toggleBookmark } = useBookmarks();

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Bookmarks</h1>
        <p className="mt-2 text-slate-500">
          Courses and lessons you&apos;ve saved for later.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center mb-6">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && bookmarks.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <div className="flex justify-center mb-4">{bookmarkIcon}</div>
          <p className="text-slate-500">
            You haven&apos;t bookmarked any courses yet.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {!loading && !error && bookmarks.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => {
            const thumbnailUrl = getThumbnailUrl(bookmark.thumbnail);

            return (
              <div
                key={bookmark.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative">
                  <div className="h-40 flex items-center justify-center bg-slate-100">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={bookmark.title ?? ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      await toggleBookmark(bookmark.courseId ?? 0);
                      await refetch();
                    }}
                    className="absolute top-3 right-3 rounded-full bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-100 transition"
                    aria-label="Remove bookmark"
                    title="Remove bookmark"
                  >
                    {bookmarkSolidIcon}
                  </button>
                </div>

                <div className="p-5">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                    {bookmark.category ?? "Uncategorized"}
                  </span>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {bookmark.title ?? "Untitled Course"}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {bookmark.description || "No description available."}
                  </p>

                  <Link
                    href={`/courses/${bookmark.courseId}`}
                    className="mt-5 block w-full rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
