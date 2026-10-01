import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createToken } from "@/lib/auth";
import { signUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { name, email, password, role } = result.data;
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.gmail, email));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      firstName: name,
      gmail: email,
      passwordHash: hashedPassword,
      role,
      createdAt: new Date(),
    });

    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.gmail, email));

    const userId = userResult[0].id;

    const token = await createToken(userId);

    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: userId,
          first_name: name,
          last_name: "",
          email,
          role,
        },
        bearer_token: token,
      },
      { status: 201 }
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
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
