"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "instructor" | "admin";
};

export type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  authLoading: boolean;
  error: string;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (active) setUser(null);
          return;
        }
        const data = (await response.json()) as { user: { id: number; name: string; email: string; role: string } };
        if (active && data) {
          const userData = data.user;
          const userObj = {
            id: userData.id,
            firstName: userData.name ?? "",
            lastName: "",
            email: userData.email,
            role: userData.role as "student" | "instructor" | "admin",
          };
          setUser(userObj);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    fetchUser();

    return () => {
      active = false;
    };
  }, []);

  async function signIn(email: string, password: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return false;
      }

      const userData = data.user;
      const userObj = {
        id: userData.id,
        firstName: userData.first_name ?? "",
        lastName: userData.last_name ?? "",
        email: userData.email,
        role: userData.role,
      };

      if (userObj.role === "student") {
        setUser(userObj);
        router.push("/courses");
      } else if (userObj.role === "instructor") {
        setUser(userObj);
        router.push("/instructor");
      } else if (userObj.role === "admin") {
        setUser(userObj);
        router.push("/admin");
      }

      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function signUp(name: string, email: string, password: string, role: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return false;
      }

      const userData = data.user;
      const userObj = {
        id: userData.id,
        firstName: userData.first_name ?? name,
        lastName: userData.last_name ?? "",
        email: userData.email,
        role: userData.role,
      };

      if (userObj.role === "student") {
        setUser(userObj);
        router.push("/courses");
      } else if (userObj.role === "instructor") {
        setUser(userObj);
        router.push("/instructor");
      } else if (userObj.role === "admin") {
        setUser(userObj);
        router.push("/admin");
      }

      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        logout,
        loading,
        authLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}