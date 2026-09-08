"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function SignUpForm() {
  const {
    signUp,
    loading,
    error,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("student");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    await signUp(
      name,
      email,
      password,
      role
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto"
    >
      <h1 className="text-2xl font-bold">
        Sign Up
      </h1>

      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}


      <input
        className="border p-2 w-full"
        placeholder="Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <input
        className="border p-2 w-full"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        className="border p-2 w-full"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <select
        className="border p-2 w-full"
        value={role}
        onChange={(e) =>
          setRole(e.target.value)
        }
      >
        <option value="student">
          Student
        </option>

        <option value="instructor">
          Instructor
        </option>

        <option value="admin">
          Admin
        </option>
      </select>

      <button
        disabled={loading}
        className="bg-black text-white p-2 w-full"
      >
        {loading
          ? "Creating..."
          : "Sign Up"}
      </button>
  
    </form>
 
  );
}