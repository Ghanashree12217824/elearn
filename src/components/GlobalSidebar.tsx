"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const studentNavLinks = [
  { href: "/", label: "Courses", icon: "courses" },
  { href: "/courses", label: "My Learning", icon: "book" },
  { href: "/courses/progress", label: "Progress", icon: "chart" },
  { href: "/courses/bookmarks", label: "Bookmarks", icon: "bookmark" },
];

const instructorNavLinks = [
  { href: "/instructor", label: "Dashboard", icon: "home" },
  { href: "/instructor/courses/create", label: "Create Course", icon: "plus" },
  { href: "/instructor/drafts", label: "Drafts", icon: "file" },
  { href: "/instructor/pos", label: "POS", icon: "pos" },
];

const iconSVGs = {
  courses: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM12 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V8zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM12 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  book: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  chart: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  bookmark: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  home: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  plus: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  file: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  pos: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6a2 2 0 012-2h1l1.724-2.586a1 1 0 011.636 0L14 4h5a2 2 0 011.995 1.835l-1.73 9.297A2 2 0 0118 16H6a2 2 0 00-1.995 1.835L3 23m-1.5-13h.01M7 15a4 4 0 11-8 0 4 4 0 018 0zm12-8a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

const logoutIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

type GlobalSidebarProps = {
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
};

export default function GlobalSidebar({
  isCollapsed,
  onCollapseChange,
}: GlobalSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
    router.refresh();
  };

  const isInstructor = user?.role === "instructor";
  const navLinks = isInstructor ? instructorNavLinks : studentNavLinks;

  const toggleSidebar = () => {
    onCollapseChange(!isCollapsed);
  };

  return (
    <aside
      className={`hidden lg:flex flex-col fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* ── Brand Header (top-left corner) ── */}
      <div className={`shrink-0 py-4 px-4 border-b border-slate-200 transition-all duration-300 ease-in-out flex items-center min-h-[64px] ${isCollapsed ? "justify-center" : ""}`}>
        <button
          type="button"
          onClick={toggleSidebar}
          className={`flex items-center gap-2 font-bold text-slate-900 transition-all duration-200 ease-in-out w-full ${isCollapsed ? "justify-center" : ""}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          {!isCollapsed && <span className="text-xl tracking-tight">LearnHub</span>}
        </button>
        
        {/* Close button - only visible when sidebar is open */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Sidebar Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* ── Navigation (top) ── */}
        <nav
          className="flex-1 overflow-y-auto px-4 pb-4 space-y-1"
          aria-label={isInstructor ? "Instructor navigation" : "Student navigation"}
        >
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== (isInstructor ? "/instructor" : "/courses") &&
              pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              title={isCollapsed ? link.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <span className="flex-shrink-0" aria-hidden="true">
                {iconSVGs[link.icon as keyof typeof iconSVGs]}
              </span>
              {!isCollapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── User profile + Logout (bottom) ── */}
      <div className="shrink-0 p-4 border-t border-slate-200 space-y-3 transition-all duration-300 ease-in-out">
        {user && (
          <div className={`flex items-center gap-3 transition-all duration-200 ease-in-out ${isCollapsed ? "justify-center" : ""}`}>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700 transition-all duration-200 ease-in-out">
              {`${user.firstName ?? ""} ${user.lastName ?? ""}`
                .split(" ")
                .filter(Boolean)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
                </p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 ease-in-out ${isCollapsed ? "justify-center" : ""}`}
        >
          {logoutIcon}
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
      </div>
    </aside>
  );
}