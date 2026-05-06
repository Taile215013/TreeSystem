"use server";

import { revalidatePath } from "next/cache";
import { supplierService } from "../services/supplier.service";
import { supplierSchema, SupplierInput } from "../schemas/supplier.schema";

export async function createSupplierAction(data: SupplierInput) {
  const result = supplierSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: result.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  try {
    await supplierService.create(result.data);
    revalidatePath("/admin/suppliers");
    revalidatePath("/admin/warehouse"); // Update warehouse form data
    return { success: true, message: "Thêm nhà cung cấp thành công" };
  } catch (error) {
    return { success: false, message: "Lỗi khi tạo nhà cung cấp" };
  }
}

export async function updateSupplierAction(id: number, data: SupplierInput) {
  const result = supplierSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: result.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  try {
    await supplierService.update(id, result.data);
    revalidatePath("/admin/suppliers");
    return { success: true, message: "Cập nhật thành công" };
  } catch (error) {
    return { success: false, message: "Lỗi khi cập nhật nhà cung cấp" };
  }
}

export async function deleteSupplierAction(id: number) {
  try {
    await supplierService.delete(id);
    revalidatePath("/admin/suppliers");
    return { success: true, message: "Đã xóa nhà cung cấp" };
  } catch (error) {
    return { success: false, message: "Không thể xóa nhà cung cấp này vì có liên quan đến dữ liệu khác" };
  }
}
