"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function SignUpForm() {
  const {
    signUp,
    loading,
    error,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await signUp(name, email, password, role);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-auto w-full max-w-md">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">
          <div className="mb-8">
            <p className="text-sm font-semibold text-indigo-600">
              CREATE ACCOUNT
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Sign Up
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create an account to start your learning journey.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">
                Sign up failed
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </label>

            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}