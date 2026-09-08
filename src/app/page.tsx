"use client";

import { useState } from "react";
import SignInForm from "@/components/SignInForm";

export default function SignInPage() {
  const [isSignInOpen, setIsSignInOpen] =
    useState(false);

  return (
    <main className="min-h-screen bg-slate-50">
      
      {/* Example navbar */}
      <nav className="flex items-center justify-between border-b bg-white px-6 py-4">
        
        <h1 className="text-xl font-bold text-slate-900">
          LearnHub
        </h1>

        <button
          type="button"
          onClick={() => setIsSignInOpen(true)}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm  hover:cursor-pointer font-semibold text-white transition hover:bg-indigo-700"
        >
          Sign In
        </button>

      </nav>

      {/* Page content */}
      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900">
            Learn something new.
          </h2>

          <p className="mt-3 text-slate-500">
            Build your skills with our online courses.
          </p>
        </div>
      </section>

      {/* Sign in modal */}
      <SignInForm
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />

    </main>
  );
}