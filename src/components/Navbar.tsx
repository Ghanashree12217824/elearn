"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "@/components/UserMenu";

const publicNavLinks = [
  { href: "/", label: "Home", key: "home" },
  { href: "/", label: "Courses", key: "courses" },
];

const studentNavLinks: { href: string; label: string }[] = [];

const instructorNavLinks: { href: string; label: string }[] = [];

export default function Navbar({ sidebarMargin = "", showSidebar = true }: { sidebarMargin?: string; showSidebar?: boolean }) {
  const { user, authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

if (authLoading) {
    return (
      <nav className={`border-b bg-white fixed top-0 left-0 right-0 z-60 w-screen transition-all duration-300 ease-in-out ${sidebarMargin}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="hidden md:flex md:items-center md:gap-8">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </nav>
    );
  }

  const isInstructor = user?.role === "instructor";
  const isStudent = user?.role === "student";
  const isAuthenticated = !!user;

  const navLinks = isInstructor
    ? instructorNavLinks
    : isStudent
    ? studentNavLinks
    : publicNavLinks;

  const handleLogout = () => {
    logout();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className={`border-b bg-white fixed top-0 left-0 right-0 z-50 w-screen transition-all duration-300 ease-in-out ${sidebarMargin}`}>
      {/* Brand logo - shown when sidebar is hidden (top-left corner) */}
      {!showSidebar && (
        <Link
          href="/"
          className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 font-bold text-slate-900 transition-colors"
          aria-label="LearnHub Home"
        >
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl tracking-tight">LearnHub</span>
        </Link>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Desktop Navigation - Left Side */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.key ?? link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname === link.href
                  ? "text-indigo-600"
                  : "text-slate-700 hover:text-indigo-600"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Navigation - Right Side (Auth/User) */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {isInstructor && <UserMenu />}
              {isStudent && (
                <div className="hidden lg:flex lg:items-center lg:gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/signin"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={mobileMenuButtonRef}
          type="button"
          className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t bg-white animate-in slide-in-from-top-2 duration-200"
        >
          <div className="px-6 py-4 space-y-3">
{navLinks.map((link) => (
               <Link
                 key={link.key ?? link.href}
                 href={link.href}
                 className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                   pathname === link.href
                     ? "bg-indigo-50 text-indigo-600"
                     : "text-slate-700 hover:bg-slate-50"
                 }`}
                 onClick={() => setIsMobileMenuOpen(false)}
               >
                 {link.label}
               </Link>
             ))}

            {isAuthenticated ? (
              <>
                <hr className="my-3 border-slate-200" />
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                    {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`
                      .split(" ")
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <hr className="my-3 border-slate-200" />
                <Link
                  href="/signin"
                  className="block w-full text-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}