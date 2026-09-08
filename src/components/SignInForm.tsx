"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type SignInFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SignInForm({ isOpen, onClose }: SignInFormProps) {
  const { signIn, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await signIn(email, password);
  }

  if (!isOpen) {
    return null;
  }

  console.log("Email", email);
  console.log("Password", password);


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close sign in"
        >
          ×
        </button>

        <div className="grid md:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="hidden min-h-[500px] items-center justify-center bg-slate-100 p-10 md:flex">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-8 flex h-56 w-56 items-center justify-center rounded-3xl bg-slate-200">
                <span className="text-7xl">📚</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Keep learning.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to continue your courses, track your progress and keep
                learning.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex min-h-[500px] items-center p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="w-full">
              {/* HEADING */}
              <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-indigo-600">
                  Welcome back
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Sign in
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to continue your learning journey.
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700">
                    Sign in failed
                  </p>

                  <p className="mt-1 text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* EMAIL */}
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="mb-3">
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
              </div>

              {/* SIGN IN */}
              <button
                type="submit"
                disabled={loading}
                className="mt-5 h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {/* DIVIDER */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">or</span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* SOCIAL */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="h-11 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Google
                </button>

                <button
                  type="button"
                  className="h-11 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Apple
                </button>
              </div>

              {/* SIGN UP */}
              <p className="mt-7 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Sign up
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
