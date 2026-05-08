"use server";

import { revalidatePath } from "next/cache";
import { productService } from "../services/product.service";
import { productSchema, updateProductSchema, CreateProductInput, UpdateProductInput } from "../schemas/product.schema";
import { ActionResponse } from "../types/product.types";
import { getUserSession } from "@/lib/session";
import { z } from "zod";

// Hàm helper tạo slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Kiểm tra quyền Admin — dùng role từ DB, không còn whitelist cứng nữa.
 */
function isAdminUser(role: string | null | undefined): boolean {
  return role === "admin";
}

export async function createProductAction(data: CreateProductInput): Promise<ActionResponse> {
  try {
    const validatedData = productSchema.parse(data);

    // 1. Kiểm tra trùng Slug trước khi Insert để có lỗi rõ ràng
    const finalSlug = validatedData.slug || generateSlug(validatedData.name);
    const existing = await productService.getBySlug(finalSlug);
    if (existing) {
      return { 
        success: false, 
        message: `Sản phẩm "${validatedData.name}" đã tồn tại (trùng Slug: ${finalSlug}). Vui lòng đổi tên hoặc kiểm tra lại!` 
      };
    }

    const dataToCreate = {
      ...validatedData,
      slug: finalSlug,
      currentPrice: validatedData.currentPrice || "0",
      status: validatedData.status || "active",
      waterNeed: validatedData.waterNeed || "Medium",
      environment: validatedData.environment || "Indoor",
      plantType: validatedData.plantType || "Leaf",
    };

    await productService.create(dataToCreate);
    revalidatePath("/admin/products");
    revalidatePath("/admin/warehouse");
    return { success: true, message: "Thêm sản phẩm thành công!" };
  } catch (error: any) {
    // Bóc tách lỗi từ Postgres (có thể nằm trong error hoặc error.cause)
    const pgError = error.cause || error;
    console.error("❌ [createProductAction ERROR]:", {
      message: pgError.message,
      code: pgError.code,
      detail: pgError.detail,
    });

    if (error instanceof z.ZodError) {
      return { success: false, message: "Dữ liệu nhập vào chưa đúng", errors: error.flatten().fieldErrors };
    }

    if (pgError.code === "23505") {
      return { success: false, message: "Tên hoặc Slug này đã tồn tại trong hệ thống." };
    }

    if (pgError.code === "23503") {
      return { success: false, message: "Lỗi liên kết: Danh mục bạn chọn không tồn tại." };
    }

    return { success: false, message: pgError.message || "Có lỗi xảy ra khi tạo sản phẩm." };
  }
}

export async function updateProductAction(id: number, data: UpdateProductInput): Promise<ActionResponse> {
  try {
    const validatedData = updateProductSchema.parse(data);
    await productService.update(id, validatedData);
    revalidatePath("/admin/products");
    return { success: true, message: "Cập nhật sản phẩm thành công!" };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Dữ liệu không hợp lệ", errors: error.flatten().fieldErrors };
    }
    if (error.code === "23505") {
      return { success: false, message: "Slug này đã tồn tại với sản phẩm khác." };
    }
    return { success: false, message: "Có lỗi khi cập nhật sản phẩm." };
  }
}

export async function bulkCreateProductsAction(productsData: Partial<CreateProductInput>[]): Promise<ActionResponse> {
  try {
    const dataToInsert = productsData
      .filter(p => p.name && p.name.trim() !== "")
      .map(p => {
        const name = p.name!.trim();
        return {
          ...p,
          name,
          slug: p.slug || (generateSlug(name) + "-" + Math.random().toString(36).substring(2, 7)),
          status: p.status || "active",
          currentPrice: p.currentPrice || "0",
          waterNeed: p.waterNeed || "Medium",
          environment: p.environment || "Indoor",
          plantType: p.plantType || "Leaf",
        };
      });

    if (dataToInsert.length === 0) return { success: false, message: "Không tìm thấy dữ liệu hợp lệ để nhập!" };

    // Insert hàng loạt
    await Promise.all(dataToInsert.map(data => productService.create(data as any)));

    revalidatePath("/admin/products");
    revalidatePath("/admin/warehouse");
    return { success: true, message: `Đã nhập thành công ${dataToInsert.length} sản phẩm với đầy đủ thông tin!` };
  } catch (error: any) {
    console.error("❌ [bulkCreateProductsAction ERROR]:", error);
    return { success: false, message: "Có lỗi khi nhập hàng loạt dữ liệu." };
  }
}

export async function bulkUpdateProductsAction(updates: { id: number; data: UpdateProductInput }[]): Promise<ActionResponse> {
  try {
    // Thực hiện cập nhật hàng loạt
    await Promise.all(
      updates.map(u => productService.update(u.id, updateProductSchema.parse(u.data)))
    );
    revalidatePath("/admin/products");
    return { success: true, message: `Đã cập nhật ${updates.length} sản phẩm thành công!` };
  } catch (error: any) {
    console.error("[bulkUpdateProductsAction ERROR]:", error);

    if (error instanceof z.ZodError) {
      return { success: false, message: "Dữ liệu cập nhật không hợp lệ, vui lòng kiểm tra lại!" };
    }

    if (error.code === "23505" || error.cause?.code === "23505") {
      return { success: false, message: "Slug hoặc Tên này đã bị trùng lặp với một sản phẩm khác." };
    }

    return { success: false, message: error.message || "Có lỗi hệ thống khi cập nhật hàng loạt sản phẩm." };
  }
}

export async function deleteProductAction(id: number, mode: "trash" | "permanent" = "trash"): Promise<ActionResponse> {
  const session = await getUserSession();
  if (!session || !isAdminUser(session.role)) {
    return { success: false, message: "Từ chối truy cập: Bạn không có quyền xóa sản phẩm." };
  }

  try {
    await productService.delete(id, mode);
    revalidatePath("/admin/products");
    return { 
      success: true, 
      message: mode === "trash" ? "Đã đưa sản phẩm vào thùng rác." : "Đã xóa vĩnh viễn sản phẩm." 
    };

  } catch (error) {
    console.error("[deleteProductAction]", error);
    return {
      success: false,
      message: "Không thể xóa — sản phẩm có liên kết đơn hàng hoặc lô hàng.",
    };
  }
}

export async function bulkDeleteProductsAction(ids: number[], mode: "trash" | "permanent" = "trash"): Promise<ActionResponse> {
  const session = await getUserSession();
  if (!session || !isAdminUser(session.role)) {
    return { success: false, message: "Từ chối truy cập: Bạn không có quyền xóa sản phẩm." };
  }

  try {
    await productService.bulkDelete(ids, mode);
    revalidatePath("/admin/products");
    return { 
      success: true, 
      message: mode === "trash" ? `Đã đưa ${ids.length} sản phẩm vào thùng rác.` : `Đã xóa vĩnh viễn ${ids.length} sản phẩm.` 
    };

  } catch (error) {
    console.error("[bulkDeleteProductsAction]", error);
    return { success: false, message: "Có lỗi khi xóa hàng loạt sản phẩm." };
  }
}

/**
 * Kiểm tra xem user hiện tại có quyền admin không.
 * Dùng trong Server Components để quyết định hiển thị UI.
 */
export async function checkIsAdminAction(): Promise<boolean> {
  const session = await getUserSession();
  return isAdminUser(session?.role);
}
