import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function createToken(userId: number) {
  return await new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      secret
    );

    const userId = Number(payload.userId);

    const result = await db
      .select({
        id: users.id,
        name: users.firstName,
        email: users.gmail,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch {
    return null;
  }
}