import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

import bcrypt from "bcryptjs";
import { email, z } from "zod";
import { or, eq } from "drizzle-orm"; // Import thêm 'or'

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // email:z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address").optional().or(z.literal("")), // Dùng .email() để validate chuẩn
}).refine((data) => data.username || data.email, {
  message: "Bạn phải nhập ít nhất Username hoặc Email",
  path: ["username"], // Hiển thị lỗi tại trường username
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { username, password, email } = result.data;

    // Kiểm tra: Nếu username khớp HOẶC email khớp thì báo lỗi
    const existingUserArray = await db
      .select()
      .from(users)
      .where(
        or(
        username ? eq(users.username, username) : undefined,
        email ? eq(users.email, email) : undefined
      )
    );

    if (existingUserArray.length > 0) {
      // Kiểm tra cụ thể cái nào bị trùng để báo lỗi chính xác
      const isEmailTaken = existingUserArray.some(u => u.email === email);
      return NextResponse.json(
        { error: isEmailTaken ? "Email đã được sử dụng" : "Username đã tồn tại" },
        { status: 409 }
      );
    }
    // // Check if user already exists
    // const existingUserArray = await db.select().from(users).where(eq(users.username, username));
    // if (existingUserArray.length > 0) {
    //   return NextResponse.json(
    //     { error: "Username already exists" },
    //     { status: 409 }
    //   );
    // }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);



    // Insert new user
    const newUserArray = await db.insert(users).values({
      username: username || null,
      passwordHash,
      email : email || null,
    }).returning({ id: users.id, username: users.username, email: users.email, createdAt: users.createdAt });

    const newUser = newUserArray[0];

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
