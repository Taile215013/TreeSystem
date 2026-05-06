import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { cookies } from "next/headers"; // Tích hợp Cookie

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_for_development";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { username, password } = result.data;

    // Retrieve user securely
    const userArray = await db.select().from(users).where(eq(users.username, username));
    const user = userArray[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // 1. Kiểm tra nếu không tìm thấy user HOẶC user không có mật khẩu trong DB
if (!user || !user.passwordHash) {
  return NextResponse.json(
    { error: "Invalid username or password" },
    { status: 401 }
  );
}
    // Check corresponding password hash
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-Only Cookie securely for SSR
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,     // Prevents JavaScript access to the cookie (XSS protection)
      secure: process.env.NODE_ENV === "production", //HTTPS in prod
      sameSite: "strict", // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json(
      { 
        message: "Login successful", 
        user: { id: user.id, username: user.username } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
