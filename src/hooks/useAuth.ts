"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
};

export function useAuth() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          if (active) {
            setUser(null);
          }
          return null;
        }

        const data = (await response.json()) as { user: User };
        return data;
      })
      .then((data) => {
        if (active && data) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setAuthLoading(false);
        }
      });

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return false;
      }

      if (data.user.role === "student") {
        setUser(data.user);
        router.push("/courses");
      } else if (data.user.role === "instructor") {
        setUser(data.user);
        router.push("/instructor");
      } else if (data.user.role === "admin") {
        setUser(data.user);
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

  async function signUp(
    name: string,
    email: string,
    password: string,
    role: string,
  ) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return false;
      }

      // Auto-login after sign-up: the API sets
      // a JWT cookie and returns the user role.
      if (data.user.role === "student") {
        setUser(data.user);
        router.push("/courses");
      } else if (
        data.user.role === "instructor"
      ) {
        setUser(data.user);
        router.push("/instructor");
      } else if (data.user.role === "admin") {
        setUser(data.user);
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
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
    router.push("/");
  }

  return {
    user,
    signIn,
    signUp,
    logout,
    loading,
    authLoading,
    error,
  };
}
