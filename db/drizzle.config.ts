import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts", // Đường dẫn đến file schema bạn đã tạo
  out: "./drizzle",         // Nơi Drizzle lưu lịch sử thay đổi database
  dialect: "postgresql",     // Hệ quản trị database bạn đang dùng
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});