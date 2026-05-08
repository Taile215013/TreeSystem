import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_for_development";

export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };

    const userArray = await db.select().from(users).where(eq(users.id, decoded.id));
    const user = userArray[0];

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      role: user.role,          // "admin" | "staff" | "customer"
      displayName: user.fullName,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  } catch {
    return null;
  }
}
