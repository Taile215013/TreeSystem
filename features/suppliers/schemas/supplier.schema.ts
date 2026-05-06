import { z } from "zod";

export const supplierSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
