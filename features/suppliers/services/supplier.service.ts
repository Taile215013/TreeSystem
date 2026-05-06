import { db } from "@/db";
import { suppliers, productBatches } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { SupplierInput } from "../schemas/supplier.schema";

export const supplierService = {
  /**
   * Lấy tất cả nhà cung cấp kèm thống kê số lô hàng đã cung cấp
   */
  async getAll() {
    return await db.select({
      id: suppliers.id,
      name: suppliers.name,
      phone: suppliers.phone,
      address: suppliers.address,
      createdAt: suppliers.createdAt,
      batchCount: sql<number>`(SELECT count(*) FROM ${productBatches} WHERE ${productBatches.supplierId} = ${suppliers.id})`.mapWith(Number)
    })
    .from(suppliers)
    .orderBy(suppliers.createdAt);
  },

  /**
   * Tạo nhà cung cấp mới
   */
  async create(data: SupplierInput) {
    return await db.insert(suppliers).values({
      name: data.name,
      phone: data.phone,
      address: data.address
    }).returning();
  },

  /**
   * Cập nhật nhà cung cấp
   */
  async update(id: number, data: SupplierInput) {
    return await db.update(suppliers)
      .set({
        name: data.name,
        phone: data.phone,
        address: data.address,
        updatedAt: new Date()
      })
      .where(eq(suppliers.id, id))
      .returning();
  },

  /**
   * Xóa nhà cung cấp
   */
  async delete(id: number) {
    return await db.delete(suppliers).where(eq(suppliers.id, id));
  }
};
