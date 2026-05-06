"use server";

import { revalidatePath } from "next/cache";
import { warehouseService } from "../services/warehouse.service";
import { createReceiptSchema, CreateReceiptInput } from "../schemas/warehouse.schema";
import { z } from "zod";

export type WarehouseActionResponse = {
  success: boolean;
  message: string;
  errors?: any;
};

/**
 * Lấy dữ liệu khởi tạo cho Form
 */
export async function getWarehouseFormDataAction() {
  try {
    return await warehouseService.getFormData();
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu kho:", error);
    return { products: [], locations: [], suppliers: [] };
  }
}

/**
 * Action xử lý tạo Phiếu nhập kho
 */
export async function createReceiptAction(data: CreateReceiptInput): Promise<WarehouseActionResponse> {
  try {
    // 1. Validate dữ liệu
    const validatedData = createReceiptSchema.parse(data);

    // 2. Gọi Service thực hiện nghiệp vụ
    await warehouseService.createReceipt(validatedData);

    // 3. Làm tươi dữ liệu
    revalidatePath("/admin/warehouse");
    revalidatePath("/admin/products"); // Vì giá sản phẩm có thể thay đổi
    revalidatePath("/");

    return {
      success: true,
      message: "Nhập kho thành công! Các lô hàng đã được khởi tạo."
    };
  } catch (error: any) {
    console.error("Lỗi Action Warehouse:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.flatten().fieldErrors
      };
    }

    return {
      success: false,
      message: error.message || "Lỗi hệ thống khi xử lý nhập kho"
    };
  }
}

/**
 * Lấy lịch sử nhập kho
 */
export async function getWarehouseHistoryAction(limit = 10) {
  try {
    return await warehouseService.getRecentReceipts(limit);
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử kho:", error);
    return [];
  }
}

