/* =========================================================
   FILE METADATA
========================================================= */
export interface FileMetadata {
  url: string;
  fileSize: number;
  mimeType: string;
  fileName: string;
}


/* =========================================================
   COURSE THUMBNAIL
========================================================= */

export interface CourseThumbnail {
  url: string;
  fileSize: number;
  mimeType: string;
  fileName: string;
}


/* =========================================================
   TAG
========================================================= */

export interface CourseBuilderTag {
  id: number;
  name: string;
}


/* =========================================================
   LESSON CONTENT TYPES
========================================================= */

export type LessonContentType =
  | "text"
  | "video"
  | "image"
  | "pdf"
  | "external_link";


/* =========================================================
   RESOURCE TYPES
========================================================= */

export type LessonResourceType =
  | "file"
  | "image"
  | "video"
  | "pdf"
  | "document"
  | "link";


/* =========================================================
   COURSE
========================================================= */

export interface CourseBuilderCourse {
  id: number | null;

  title: string;

  description: string;

  thumbnail: CourseThumbnail | null;

  category: {
    id: number;
    title: string;
  } | null;

  instructor: {
    id: number;
    name: string;
    bio: string;
    experience: string;
  } | null;

  price: number;

  level: "beginner" | "intermediate" | "advanced";

  tags: CourseBuilderTag[];
}


/* =========================================================
   LESSON CONTENT
========================================================= */

export interface LessonContent {
  /*
    Automatically generated UUID.

    Example:
    "8c4a7b3e-5f3d-4a12-9f21-2c7e6b8a91d4"
  */
  contentId: string;

  type: LessonContentType;

  /*
    Rich Text Editor output.

    Example:
    "<h2>What is HTML?</h2><p>HTML is...</p>"
  */
  body?: string;

  caption?: string;

  /*
    Used when content requires file metadata.
  */
  metadata?: FileMetadata;
}


/* =========================================================
   LESSON RESOURCE
========================================================= */

export interface LessonResource {
  /*
    Normal database ID.
    It is NOT a UUID.
  */
  id: number;

  title: string;



  metadata: FileMetadata;
}


/* =========================================================
   LESSON
========================================================= */

export interface CourseBuilderLesson {
  /*
    Normal database ID.
    It is NOT a UUID.
  */
  id: number;

  title: string;

  description: string;

  /*
    One main content object.
  */
  content: LessonContent | null;

  /*
    Optional resources.
  */
  resources: LessonResource[];
}


/* =========================================================
   MODULE
========================================================= */

export interface CourseBuilderModule {
  /*
    Normal database ID.
    It is NOT a UUID.
  */
  id: number;

  title: string;

  description: string;

  lessons: CourseBuilderLesson[];
}


/* =========================================================
   COMPLETE COURSE BUILDER
========================================================= */

export interface CourseBuilderDraft {
  course: CourseBuilderCourse;

  modules: CourseBuilderModule[];
}