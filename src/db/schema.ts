import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  datetime,
  json,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/* =========================================================
   USERS
========================================================= */

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),

  firstName: varchar("first_name", { length: 45 }),

  lastName: varchar("last_name", { length: 45 }),

  gmail: varchar("gmail", { length: 45 }),

  passwordHash: varchar("password_hash", { length: 45 }),

  username: varchar("username", { length: 45 }),

  // Replace these values with the exact ENUM values
  // from your existing database.
  role: mysqlEnum("role", [
    
    "student",
    "instructor",
    "admin",
  ]),
});


/* =========================================================
   INSTRUCTOR PROFILE
========================================================= */

export const instructorProfile = mysqlTable("instructor_profile", {
  userId: int("user_id").primaryKey(),

  qualification: varchar("qualification", { length: 45 }),

  specialization: varchar("specialization", { length: 45 }),

  joinedAt: datetime("joined_at"),

  experiencedYears: int("experienced_years"),

  bio: varchar("bio", { length: 45 }),
});


/* =========================================================
   STUDENT PROFILE
========================================================= */

export const studentProfile = mysqlTable("student_profile", {
  userId: int("user_id").primaryKey(),

  bio: varchar("bio", { length: 45 }),

  education: varchar("education", { length: 45 }),

  dob: date("dob"),

  joinedAt: datetime("joined_at"),
});


/* =========================================================
   CATEGORIES
========================================================= */

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),

  name: varchar("name", { length: 45 }),
});


/* =========================================================
   COURSES
========================================================= */

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),

  title: varchar("title", { length: 45 }),

  description: varchar("description", { length: 45 }),

  slug: varchar("slug", { length: 45 }),

  instructorId: int("instructor_id"),

  categoryId: int("category_id"),

  createdAt: datetime("created_at"),

  updatedAt: varchar("updated_at", { length: 45 }),

  // Replace with the exact ENUM values
  level: mysqlEnum("level", [
    "beginner",
    "intermediate",
    "advanced",
  ]),

  // Replace with the exact ENUM values
  status: mysqlEnum("status", [
    "draft",
    "published",
  ]),

  price: int("price"),

  publishedAt: date("published_at"),
});


/* =========================================================
   ENROLLMENT
========================================================= */

export const enrollment = mysqlTable("enrollment", {
  courseId: int("course_id"),

  userId: int("user_id"),

  id: varchar("id", { length: 45 }),

  enrolledAt: date("enrolled_at"),

  // Replace with the exact ENUM values
  status: mysqlEnum("status", [
    "active",
    "completed",
    "cancelled",
  ]),
});


/* =========================================================
   MODULES
========================================================= */

export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),

  title: varchar("title", { length: 45 }),

  description: varchar("description", { length: 45 }),

  courseId: int("course_id"),
});


/* =========================================================
   LESSON
========================================================= */

export const lesson = mysqlTable("lesson", {
  id: int("id").autoincrement().primaryKey(),

  title: varchar("title", { length: 45 }),

  moduleId: int("module_id"),
});


/* =========================================================
   CONTENTS
========================================================= */

export const contents = mysqlTable("contents", {
  id: int("id").autoincrement().primaryKey(),

  lessonId: int("lesson_id"),

  type: varchar("type", { length: 45 }),

  title: varchar("title", { length: 45 }),

  body: varchar("body", { length: 45 }),

  position: int("position"),
});


/* =========================================================
   QUIZ
========================================================= */

export const quiz = mysqlTable("quiz", {
  id: int("id").autoincrement().primaryKey(),

  title: varchar("title", { length: 45 }),

  moduleId: int("module_id"),

  totalMarks: varchar("total_marks", { length: 45 }),

  totalMinutes: varchar("total_minutes", { length: 45 }),
});


/* =========================================================
   QUESTIONS
========================================================= */

export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),

  questionText: varchar("question_text", { length: 45 }),

  quizId: int("quiz_id"),

  marks: varchar("marks", { length: 45 }),

  position: varchar("position", { length: 45 }),

  createdAt: varchar("created_at", { length: 45 }),

  updatedAt: varchar("updated_at", { length: 45 }),

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

export const usersRelations = relations(users, ({ one, many }) => ({
  instructorProfile: one(instructorProfile, {
    fields: [users.id],
    references: [instructorProfile.userId],
  }),

  studentProfile: one(studentProfile, {
    fields: [users.id],
    references: [studentProfile.userId],
  }),

  enrollments: many(enrollment),

  submissions: many(submission),
}));


export const instructorProfileRelations = relations(
  instructorProfile,
  ({ one }) => ({
    user: one(users, {
      fields: [instructorProfile.userId],
      references: [users.id],
    }),
  })
);


export const studentProfileRelations = relations(
  studentProfile,
  ({ one }) => ({
    user: one(users, {
      fields: [studentProfile.userId],
      references: [users.id],
    }),
  })
);


export const categoriesRelations = relations(
  categories,
  ({ many }) => ({
    courses: many(courses),
  })
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

    enrollments: many(enrollment),
  })
);


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
  })
);


export const modulesRelations = relations(
  modules,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [modules.courseId],
      references: [courses.id],
    }),

    lessons: many(lesson),

    quizzes: many(quiz),
  })
);


export const lessonRelations = relations(
  lesson,
  ({ one, many }) => ({
    module: one(modules, {
      fields: [lesson.moduleId],
      references: [modules.id],
    }),

    contents: many(contents),
  })
);


export const contentsRelations = relations(
  contents,
  ({ one }) => ({
    lesson: one(lesson, {
      fields: [contents.lessonId],
      references: [lesson.id],
    }),
  })
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
  })
);


export const questionsRelations = relations(
  questions,
  ({ one, many }) => ({
    quiz: one(quiz, {
      fields: [questions.quizId],
      references: [quiz.id],
    }),

    submissions: many(submission),
  })
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
  })
);