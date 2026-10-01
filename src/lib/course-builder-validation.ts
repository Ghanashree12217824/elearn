import { z } from "zod";


/* =========================================================
   UUID
========================================================= */

const contentIdSchema = z
  .string()
  .uuid("Invalid content UUID");


/* =========================================================
   FILE METADATA
========================================================= */

export const fileMetadataSchema = z.object({
  url: z.string().url("Invalid file URL"),

  fileSize: z
    .number()
    .nonnegative("File size cannot be negative"),

  mimeType: z
    .string()
    .min(1, "MIME type is required"),

  fileName: z
    .string()
    .min(1, "File name is required"),
});

/* =========================================================
   COURSE THUMBNAIL
========================================================= */

export const courseThumbnailSchema = z.object({
  url: z.string().url("Invalid thumbnail URL"),

  fileSize: z
    .number()
    .nonnegative("Thumbnail file size cannot be negative"),

  mimeType: z
    .string()
    .min(1, "Thumbnail MIME type is required"),

  fileName: z
    .string()
    .min(1, "Thumbnail file name is required"),
});

/* =========================================================
   TAG
========================================================= */

export const courseBuilderTagSchema = z.object({
  id: z.number().int().positive(),

  name: z.string().min(1, "Tag name is required"),
});


/* =========================================================
   CONTENT TYPE
========================================================= */

export const lessonContentTypeSchema = z.enum([
  "text",
  "video",
  "image",
  "pdf",
  "external_link",
]);


/* =========================================================
   RESOURCE TYPE
========================================================= */

export const lessonResourceTypeSchema = z.enum([
  "file",
  "image",
  "video",
  "pdf",
  "document",
  "link",
]);


/* =========================================================
   COURSE
========================================================= */

export const courseBuilderCourseSchema = z.object({
  /*
    Normal database ID.
    null when the course hasn't been saved yet.
  */
  id: z
    .number()
    .int()
    .positive()
    .nullable(),

  title: z
    .string()
    .min(2, "Course title must be at least 2 characters"),

  description: z
    .string()
    .min(
      5,
      "Course description must be at least 5 characters",
    ),

  thumbnail: courseThumbnailSchema.nullable(),

  category: z
    .object({
      id: z.number().int().positive(),

      title: z.string().min(1),
    })
    .nullable(),

  instructor: z
    .object({
      id: z.number().int().positive(),

      name: z.string().min(1),

      bio: z.string(),

      experience: z.string(),
    })
    .nullable(),

  price: z
    .number()
    .int()
    .nonnegative("Price cannot be negative"),

  level: z.enum([
    "beginner",
    "intermediate",
    "advanced",
  ]),

  tags: z.array(courseBuilderTagSchema),
});


/* =========================================================
   LESSON CONTENT
========================================================= */

export const lessonContentSchema = z.object({
  /*
    THIS is the only UUID in the structure.
  */
  contentId: contentIdSchema,

  type: lessonContentTypeSchema,

  /*
    Rich Text Editor output.
  */
  body: z.string().optional(),

  caption: z.string().optional(),

  metadata: fileMetadataSchema.optional(),
});


/* =========================================================
   LESSON RESOURCE
========================================================= */

export const lessonResourceSchema = z.object({
  /*
    Normal database ID.
  */
  id: z
    .number()
    .int()
    .positive()
    .nullable(),

  title: z
    .string()
    .min(1, "Resource title is required"),

  type: lessonResourceTypeSchema,

  metadata: fileMetadataSchema,
});


/* =========================================================
   LESSON
========================================================= */

export const courseBuilderLessonSchema = z.object({
  /*
    Normal database ID.
  */
  id: z
    .number()
    .int()
    .positive()
    .nullable(),

  title: z
    .string()
    .min(1, "Lesson title is required"),

  description: z.string(),

  content: lessonContentSchema.nullable(),

  resources: z.array(
    lessonResourceSchema,
  ),
});


/* =========================================================
   MODULE
========================================================= */

export const courseBuilderModuleSchema = z.object({
  /*
    Normal database ID.
  */
  id: z
    .number()
    .int()
    .positive()
    .nullable(),

  title: z
    .string()
    .min(1, "Module title is required"),

  description: z.string(),

  lessons: z.array(
    courseBuilderLessonSchema,
  ),
});


/* =========================================================
   COMPLETE COURSE BUILDER
========================================================= */

export const courseBuilderDraftSchema = z.object({
  course: courseBuilderCourseSchema,

  modules: z.array(
    courseBuilderModuleSchema,
  ),
});


/* =========================================================
   TYPE
========================================================= */

export type CourseBuilderDraftInput = z.infer<
  typeof courseBuilderDraftSchema
>;