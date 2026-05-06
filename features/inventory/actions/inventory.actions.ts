"use server";

import { inventoryService } from "../services/inventory.service";

/**
 * Lấy dữ liệu tồn kho hội sở (theo lô/toa hàng)
 */
export async function getInventoryAction() {
  try {
    const data = await inventoryService.getInventoryData();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tồn kho:", error);
    return {
      success: false,
      message: "Không thể tải dữ liệu tồn kho",
      data: []
    };
  }
}
