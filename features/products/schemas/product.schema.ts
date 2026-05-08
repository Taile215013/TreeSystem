import { z } from "zod";

// --- Enums ---
export const waterNeedEnum = z.enum(["Low", "Medium", "High", "Aquatic"]);
export const environmentEnum = z.enum(["Outdoor", "Indoor", "Hybrid"]);
export const plantTypeEnum = z.enum(["Flower", "Leaf", "Fruit"]);

/**
 * Schema tạo mới sản phẩm.
 * Lưu ý: minPrice và maxPrice KHÔNG có ở đây.
 * Chúng sẽ được cập nhật tự động từ nghiệp vụ Nhập Kho.
 */
export const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống").max(255, "Tên quá dài"),
  slug: z.string().max(255, "Slug quá dài").optional(),
  description: z.string().optional().nullable().transform(val => val === "" ? null : val),
  imageUrl: z.string()
    .url("Link ảnh không hợp lệ")
    .or(z.literal(""))
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),

  categoryId: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().nullable().optional()
  ),

  // Giá bán hiển thị
  currentPrice: z.preprocess(
    (val) => (val === "" ? 0 : val),
    z.coerce.number().min(0, "Giá không được âm")
  ).transform((val) => val.toString()).optional(),

  status: z.enum(["active", "draft", "archived"]).optional(),

  // Thuộc tính đặc thù của cây cảnh
  waterNeed: waterNeedEnum.optional(),
  environment: environmentEnum.optional(),
  plantType: plantTypeEnum.optional(),

  // Kích thước
  potSize: z.string().optional().nullable().transform(val => val === "" ? null : val),
  height: z.string().optional().nullable().transform(val => val === "" ? null : val),
  diameter: z.string().optional().nullable().transform(val => val === "" ? null : val),
});

export type CreateProductInput = z.infer<typeof productSchema>;

// Tách riêng Update Schema để không có default value, giúp Partial() hoạt động đúng nghĩa (chỉ update những gì gửi lên)
export const updateProductSchema = productSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
