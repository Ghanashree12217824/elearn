"use client";

import { useAuth } from "@/hooks/useAuth";
import InstructorSidebar from "@/components/InstructorSidebar";
import { ReactNode } from "react";

export default function InstructorDashboardLayout({ children }: { children: ReactNode }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <aside className="h-16 border-b bg-white">
          <div className="h-full animate-pulse bg-slate-50" />
        </aside>
        <div className="flex flex-1">
          <aside className="hidden lg:block w-64 bg-white border-r border-slate-200">
            <div className="h-full animate-pulse bg-slate-50" />
          </aside>
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-6 py-12 space-y-8">
              <div className="h-8 bg-slate-200 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "instructor") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex flex-1">
        <InstructorSidebar />
        <main className="flex-1 lg:ml-64 pt-16 min-h-screen overflow-y-auto transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
}