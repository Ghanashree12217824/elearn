"use client";

import { useAuth } from "@/hooks/useAuth";
import GlobalSidebar from "@/components/GlobalSidebar";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { ReactNode, Suspense, useState } from "react";

const EXCLUDED_PATHS = [
  "/instructor/courses/create",
];

function isExcludedPath(pathname: string): boolean {
  if (EXCLUDED_PATHS.includes(pathname)) {
    return true;
  }
  if (pathname.match(/^\/instructor\/courses\/[^/]+\/edit$/)) {
    return true;
  }
  return false;
}

function GlobalSidebarWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, authLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const showSidebar = !isExcludedPath(pathname);
  const sidebarMargin = showSidebar
    ? (isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64")
    : "";

if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar sidebarMargin="" showSidebar={false} />
        <div className="flex flex-1">
          <aside className="hidden lg:block fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200">
            <div className="h-full animate-pulse bg-slate-50" />
          </aside>
          <main className="flex-1 pt-16 lg:ml-64">
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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar sidebarMargin="" showSidebar={false} />
        <main className="flex-1 pt-16">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar sidebarMargin={sidebarMargin} showSidebar={showSidebar} />
      <div className="flex flex-1">
        {showSidebar && (
          <GlobalSidebar
            isCollapsed={isSidebarCollapsed}
            onCollapseChange={setIsSidebarCollapsed}
          />
        )}
        <main
          className={`flex-1 pt-16 min-h-screen overflow-y-auto transition-all duration-300 ease-in-out ${sidebarMargin}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function GlobalLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" />
      </div>
    }>
      <GlobalSidebarWrapper>{children}</GlobalSidebarWrapper>
    </Suspense>
  );
}