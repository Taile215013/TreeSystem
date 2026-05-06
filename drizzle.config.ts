import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // ĐÂY LÀ DÒNG BẠN ĐANG THIẾU
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});