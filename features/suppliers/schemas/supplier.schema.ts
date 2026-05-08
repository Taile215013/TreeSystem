import { z } from "zod";

export const supplierSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự"),
  imageUrl: z.string().url("Link ảnh không hợp lệ").optional().or(z.literal("")),
  phone: z.string().min(10, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  specifications: z.string().optional().or(z.literal("")),
  type: z.enum(["garden", "provider"]),
});



export type SupplierInput = z.infer<typeof supplierSchema>;
