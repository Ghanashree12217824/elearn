import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  role: z.enum([
    "student",
    "instructor",
    "admin",
  ]),
});

export const signInSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const courseSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters"),

  description: z
    .string()
    .min(5, "Description must be at least 5 characters"),
});