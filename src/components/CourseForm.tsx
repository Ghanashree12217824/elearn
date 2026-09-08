"use client";

import { useState } from "react";
import { useCourses } from "@/hooks/useCourses";

export default function CourseForm() {
  const {
    createCourse,
  } = useCourses();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const success =
      await createCourse(
        title,
        description
      );

    if (success) {
      setTitle("");
      setDescription("");
    }
  }

 
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border p-5"
    >
      <h2 className="text-xl font-bold">
        Create Course
      </h2>

      <input
        className="border p-2 w-full"
        placeholder="Course title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <textarea
        className="border p-2 w-full"
        placeholder="Course description"
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
      />

      <button className="bg-black text-white px-4 py-2">
        Create Course
      </button>
    </form>
  );
}