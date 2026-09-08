import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

import { createToken } from "@/lib/auth";
import { signInSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = signInSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: result.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const {
      email,
      password,
    } = result.data;

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.gmail, email));

    if (userResult.length === 0) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const user = userResult[0];

    if (!user.passwordHash) {
  return NextResponse.json(
    {
      message: "This account does not have a password set.",
    },
    {
      status: 401,
    }
  );
}

if (!user.passwordHash) {
  return NextResponse.json(
    {
      message: "Password is not set for this account",
    },
    {
      status: 401,
    }
  );
}

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );
    if (!passwordMatches) {
  return NextResponse.json(
    {
      message: "Invalid email or password",
    },
    {
      status: 401,
    }
  );
}

   

    const token = await createToken(user.id);

    const response = NextResponse.json(
      {
        message: "Sign in successful",
        user: {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.gmail,
          role: user.role,
        },
        bearer_token: token
      },
      {
        status: 200,
      }
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
   } catch (error) {
  console.error("SIGN IN ERROR:", error);

  return NextResponse.json(
    {
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    },
    {
      status: 500,
    }
  );
}
}