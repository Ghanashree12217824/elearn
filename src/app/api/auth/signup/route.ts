import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
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
        {
          status: 400,
        }
      );
    }

    const {
      name,
      email,
      password,
      role,
    } = result.data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.gmail, email));

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          message: "Email already exists",
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await db.insert(users).values({
      firstName,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
