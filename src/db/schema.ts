import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  datetime,
  json,
  mysqlEnum,
  timestamp,
  tinyint,
  index,
} from "drizzle-orm/mysql-core";

import { relations, and, or, eq, desc } from "drizzle-orm";

/* =========================================================
   USERS
========================================================= */

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),

  firstName: varchar("first_name", { length: 45 }),

  lastName: varchar("last_name", { length: 45 }),

  gmail: varchar("gmail", { length: 45 }),

  passwordHash: varchar("password_hash", { length: 255 }),

  username: varchar("username", { length: 45 }),

  role: mysqlEnum("role", [
    "student",
    "instructor",
    "admin",
  ]),

  createdAt: datetime("created_at").notNull(),
});


/* =========================================================
   INSTRUCTOR PROFILE
========================================================= */

export const instructorProfile = mysqlTable("instructor_profile", {
  userId: int("user_id").primaryKey(),

  qualification: varchar("qualification", { length: 45 }),

  specialization: varchar("specialization", { length: 45 }),

  joinedAt: datetime("joined_at").notNull(),

  experiencedYears: int("experienced_years"),

  bio: text("bio"),
});


/* =========================================================
   STUDENT PROFILE
========================================================= */

export const studentProfile = mysqlTable("student_profile", {
  userId: int("user_id").primaryKey(),

  bio: text("bio"),

  education: varchar("education", { length: 45 }),

  dob: date("dob"),

  joinedAt: datetime("joined_at").notNull(),
});


/* =========================================================
   CATEGORIES
========================================================= */

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),

  name: varchar("name", { length: 45 }),
});


/* =========================================================
   TAGS
========================================================= */

export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),

  name: varchar("name", { length: 45 }),
});


/* =========================================================
   COURSES
========================================================= */

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),

  title: varchar("title", { length: 45 }),

  description: text("description"),

  /*
    Example:

    {
      "url": "https://testing.com/course-thumbnail.jpg",
      "name": "course-thumbnail.jpg",
      "size": 125430,
      "mimeType": "image/jpeg"
    }
  */
  thumbnail: json("thumbnail"),

  instructorId: int("instructor_id"),

  categoryId: int("category_id"),

  price: int("price"),

  level: mysqlEnum("level", [
    "beginner",
    "intermediate",
    "advanced",
  ]),

  status: mysqlEnum("status", [
    "draft",
    "published",
  ]).default("draft"),

  createdAt: datetime("created_at").notNull(),

  updatedAt: datetime("updated_at"),

  publishedAt: datetime("published_at"),
});


/* =========================================================
   COURSE TAGS
========================================================= */

export const courseTags = mysqlTable("course_tags", {
  courseId: int("course_id").notNull(),

  tagId: int("tag_id").notNull(),
});


/* =========================================================
   MODULES
========================================================= */

export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),

  courseId: int("course_id").notNull(),

  title: varchar("title", { length: 45 }),

  description: text("description"),

  position: int("position"),

  createdAt: datetime("created_at").notNull(),

  updatedAt: datetime("updated_at"),
});


/* =========================================================
   LESSONS
========================================================= */

export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),

  moduleId: int("module_id").notNull(),

  title: varchar("title", { length: 45 }),

  description: text("description"),

  /*
    Example:

    {
      "contentId": "uuid",
      "type": "text",
      "body": "rich text <p>Hello</p>"
    }
  */
  content: json("content"),

  position: int("position"),

  createdAt: datetime("created_at").notNull(),

  updatedAt: datetime("updated_at"),
});


/* =========================================================
   LESSON RESOURCES
========================================================= */

export const lessonResources = mysqlTable("lesson_resources", {
  id: int("id").autoincrement().primaryKey(),

  lessonId: int("lesson_id").notNull(),

  title: varchar("title", { length: 45 }),

  /*
    Example:

    {
      "url": "https://testing.com/course-thumbnail.jpg",
      "fileSize": 119112,
      "mimeType": "image/jpeg",
      "fileName": "image.jpg"
    }
  */
  metadata: json("metadata"),

  position: int("position"),

  createdAt: datetime("created_at").notNull(),

  updatedAt: datetime("updated_at"),
});


/* =========================================================
   COURSE BUILDER DRAFT
========================================================= */

export const courseBuilderDraft = mysqlTable(
  "course_builder_draft",
  {
    id: int("id").autoincrement().primaryKey(),

    uuid: varchar("uuid", { length: 36 }).notNull().unique(),

    instructorId: int("instructor_id").notNull(),

    sessionId: varchar("session_id", { length: 36 }),

    status: mysqlEnum("status", [
      "active",
      "completed",
      "published",
      "abandoned",
      "expired",
    ]).notNull().default("active"),

    currentStep: tinyint("current_step", { unsigned: true }).notNull().default(1),

    completionPct: tinyint("completion_pct", { unsigned: true }).notNull().default(0),

    /*
      Entire Course Builder JSON

      {
        "course": {...},
        "modules": [
          {
            "lessons": [...]
          }
        ]
      }
    */
    draftData: json("draft_data").notNull(),

    version: int("version", { unsigned: true }).notNull().default(1),

    parentDraftId: int("parent_draft_id", { unsigned: true }),

    /*
      When non-null, this draft represents pending changes
      for an already-published course. The live course content
      is NOT overwritten until the instructor explicitly
      publishes the draft.
    */
    sourceCourseId: int("source_course_id"),

    clientInfo: json("client_info"),

    tags: json("tags"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().onUpdateNow(),
    expiresAt: timestamp("expires_at"),
    lastActivityAt: timestamp("last_activity_at"),
  },
  (table) => ({
    instructorStatusIdx: index("idx_draft_instructor_status").on(table.instructorId, table.status, table.updatedAt),
    sessionIdx: index("idx_draft_session").on(table.sessionId),
    expiresIdx: index("idx_draft_expires").on(table.expiresAt),
    parentIdx: index("idx_draft_parent").on(table.parentDraftId),
  }),
);


/* =========================================================
   ENROLLMENT
========================================================= */

export const enrollment = mysqlTable("enrollment", {
  courseId: int("course_id"),

  userId: int("user_id"),

  id: varchar("id", { length: 45 }),

  enrolledAt: date("enrolled_at").notNull(),

  status: mysqlEnum("status", [
    "active",
    "completed",
    "cancelled",
  ]),
});


/* =========================================================
   QUIZ
========================================================= */

export const quiz = mysqlTable("quiz", {
  id: int("id").autoincrement().primaryKey(),

  title: varchar("title", { length: 45 }),

  moduleId: int("module_id"),

  totalMarks: int("total_marks"),

  totalMinutes: int("total_minutes"),
});


/* =========================================================
   QUESTIONS
========================================================= */

export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),

  questionText: text("question_text"),

  quizId: int("quiz_id"),

  marks: int("marks"),

  position: int("position"),

  createdAt: datetime("created_at").notNull(),

  updatedAt: datetime("updated_at"),

  optionText: json("option_text"),
});


/* =========================================================
   SUBMISSION
========================================================= */

export const submission = mysqlTable("submission", {
  id: int("id").autoincrement().primaryKey(),

  quizId: int("quiz_id"),

  questionId: int("question_id"),

  userId: int("user_id"),
});


/* =========================================================
   RELATIONS
========================================================= */

export const usersRelations = relations(
  users,
  ({ one, many }) => ({
    instructorProfile: one(instructorProfile, {
      fields: [users.id],
      references: [instructorProfile.userId],
    }),

    studentProfile: one(studentProfile, {
      fields: [users.id],
      references: [studentProfile.userId],
    }),

    courses: many(courses),

    enrollments: many(enrollment),

    submissions: many(submission),

    courseBuilderDrafts: many(courseBuilderDraft),
  }),
);


export const instructorProfileRelations = relations(
  instructorProfile,
  ({ one }) => ({
    user: one(users, {
      fields: [instructorProfile.userId],
      references: [users.id],
    }),
  }),
);


export const studentProfileRelations = relations(
  studentProfile,
  ({ one }) => ({
    user: one(users, {
      fields: [studentProfile.userId],
      references: [users.id],
    }),
  }),
);


export const categoriesRelations = relations(
  categories,
  ({ many }) => ({
    courses: many(courses),
  }),
);


export const tagsRelations = relations(
  tags,
  ({ many }) => ({
    courseTags: many(courseTags),
  }),
);


export const courseTagsRelations = relations(
  courseTags,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseTags.courseId],
      references: [courses.id],
    }),

    tag: one(tags, {
      fields: [courseTags.tagId],
      references: [tags.id],
    }),
  }),
);


export const coursesRelations = relations(
  courses,
  ({ one, many }) => ({
    instructor: one(users, {
      fields: [courses.instructorId],
      references: [users.id],
    }),

    category: one(categories, {
      fields: [courses.categoryId],
      references: [categories.id],
    }),

    modules: many(modules),

    courseTags: many(courseTags),

    enrollments: many(enrollment),
  }),
);


export const modulesRelations = relations(
  modules,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [modules.courseId],
      references: [courses.id],
    }),

    lessons: many(lessons),

    quizzes: many(quiz),
  }),
);


export const lessonsRelations = relations(
  lessons,
  ({ one, many }) => ({
    module: one(modules, {
      fields: [lessons.moduleId],
      references: [modules.id],
    }),

    resources: many(lessonResources),
  }),
);


export const lessonResourcesRelations = relations(
  lessonResources,
  ({ one }) => ({
    lesson: one(lessons, {
      fields: [lessonResources.lessonId],
      references: [lessons.id],
    }),
  }),
);


export const courseBuilderDraftRelations =
  relations(
    courseBuilderDraft,
    ({ one }) => ({
      instructor: one(users, {
        fields: [
          courseBuilderDraft.instructorId,
        ],
        references: [users.id],
      }),
    })
  )


export const enrollmentRelations = relations(
  enrollment,
  ({ one }) => ({
    course: one(courses, {
      fields: [enrollment.courseId],
      references: [courses.id],
    }),

    user: one(users, {
      fields: [enrollment.userId],
      references: [users.id],
    }),
  }),
);


export const quizRelations = relations(
  quiz,
  ({ one, many }) => ({
    module: one(modules, {
      fields: [quiz.moduleId],
      references: [modules.id],
    }),

    questions: many(questions),

    submissions: many(submission),
  }),
);


export const questionsRelations = relations(
  questions,
  ({ one, many }) => ({
    quiz: one(quiz, {
      fields: [questions.quizId],
      references: [quiz.id],
    }),

    submissions: many(submission),
  }),
);


export const submissionRelations = relations(
  submission,
  ({ one }) => ({
    quiz: one(quiz, {
      fields: [submission.quizId],
      references: [quiz.id],
    }),

    question: one(questions, {
      fields: [submission.questionId],
      references: [questions.id],
    }),

    user: one(users, {
      fields: [submission.userId],
      references: [users.id],
    }),
  }),
);