"use client";

import { useState } from "react";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

export default function SignInPage() {
  const {
    signIn,
    loading,
    error,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    await signIn(email, password);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-auto w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-10 shadow-xl"
        >
          <div className="mb-8">
            <p className="text-sm font-semibold text-indigo-600">
              WELCOME BACK
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Sign In
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue your learning journey.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">
                Sign in failed
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              required
            />
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <button
                type="button"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </button>
            </div>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}