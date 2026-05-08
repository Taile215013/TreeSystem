/**
 * Script: Cập nhật role = "admin" cho user admin_tai1
 * Chạy: npx tsx scripts/set-admin-role.ts
 */
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  // Cập nhật tất cả user có username bắt đầu bằng "admin" thành role admin
  const result = await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.username, "admin_tai1"))
    .returning({ id: users.id, username: users.username, role: users.role });

  if (result.length > 0) {
    console.log("✅ Đã cập nhật role admin cho:");
    result.forEach((u) => console.log(`   - ${u.username} (id: ${u.id}) → role: ${u.role}`));
  } else {
    console.log("⚠️ Không tìm thấy user admin_tai1. Kiểm tra lại username trong DB.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});
