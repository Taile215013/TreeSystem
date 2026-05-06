import { z } from "zod";

/**
 * Schema cho từng sản phẩm trong phiếu nhập
 */
export const batchItemSchema = z.object({
  productId: z.number().min(1, "Vui lòng chọn sản phẩm"),
  importPrice: z.coerce.number().min(0, "Giá nhập không được âm"),
  quantity: z.coerce.number().min(1, "Số lượng phải ít nhất là 1"),
  unit: z.string().optional().nullable(),
  supplierId: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  minPrice: z.coerce.number().optional().default(0),
  maxPrice: z.coerce.number().optional().default(0),
});

/**
 * Schema tổng quát cho Phiếu Nhập Kho (Warehouse Receipt)
 */
export const createReceiptSchema = z.object({
  receiptCode: z.string().min(1, "Mã phiếu là bắt buộc"),
  supplierId: z.coerce.number().optional().nullable(),
  locationId: z.coerce.number().min(1, "Vui lòng chọn vị trí kho"),
  shippingCost: z.coerce.number().default(0),
  laborCost: z.coerce.number().default(0),
  notes: z.string().optional(),
  items: z.array(batchItemSchema).min(1, "Vui lòng thêm ít nhất một sản phẩm"),
});

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type BatchItemInput = z.infer<typeof batchItemSchema>;
