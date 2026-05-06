"use server";

import { db } from "@/db";
import { monthlyExpenses } from "@/db/schema";
import { expenseSchema, ExpenseInput } from "../schemas/finance.schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Thêm một khoản chi phí mới
 */
export async function addExpenseAction(data: ExpenseInput) {
  try {
    const validated = expenseSchema.parse(data);

    await db.insert(monthlyExpenses).values({
      category: validated.category,
      type: validated.type,
      status: validated.status,
      amount: validated.amount.toString(),
      expenseDate: validated.expenseDate,
      notes: validated.notes,
    });

    revalidatePath("/admin/finance");
    return { success: true, message: "Đã ghi nhận chi phí thành công!" };
  } catch (error: any) {
    console.error("Lỗi thêm chi phí:", error);
    return { success: false, message: error.message || "Không thể thêm chi phí" };
  }
}

/**
 * Xóa một khoản chi phí
 */
export async function deleteExpenseAction(id: number) {
  try {
    await db.delete(monthlyExpenses).where(eq(monthlyExpenses.id, id));
    revalidatePath("/admin/finance");
    return { success: true, message: "Đã xóa chi phí thành công!" };
  } catch (error: any) {
    return { success: false, message: "Không thể xóa chi phí" };
  }
}

/**
 * Chuyển trạng thái từ "Đang chờ" sang "Đã thanh toán"
 */
export async function markAsPaidAction(id: number) {
  try {
    await db.update(monthlyExpenses)
      .set({ status: 'paid' })
      .where(eq(monthlyExpenses.id, id));
    
    revalidatePath("/admin/finance");
    return { success: true, message: "Đã cập nhật trạng thái thanh toán!" };
  } catch (error: any) {
    return { success: false, message: "Không thể cập nhật trạng thái" };
  }
}
