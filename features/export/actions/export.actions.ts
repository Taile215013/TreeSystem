"use server";

import { db } from "@/db";
import { warehouseReceipts, productBatches, products, suppliers } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import type { ReceiptExportRow, PriceListRow } from "../types/export.types";

export type { ReceiptExportRow, PriceListRow } from "../types/export.types";

// ──────────────────────────────────────────────
// Lấy tất cả ngày có phiếu nhập (để highlight calendar)
// ──────────────────────────────────────────────
export async function getReceiptDatesAction(): Promise<string[]> {
  const rows = await db
    .selectDistinct({
      date: sql<string>`DATE(${warehouseReceipts.createdAt})`,
    })
    .from(warehouseReceipts)
    .orderBy(sql`DATE(${warehouseReceipts.createdAt}) DESC`);

  return rows.map((r) => r.date).filter(Boolean);
}

// ──────────────────────────────────────────────
// Lấy phiếu nhập theo khoảng ngày
// ──────────────────────────────────────────────
export async function getReceiptsByDateRangeAction(
  from: string,
  to: string
): Promise<ReceiptExportRow[]> {
  const fromDate = new Date(from);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      id: warehouseReceipts.id,
      receiptCode: warehouseReceipts.receiptCode,
      supplierName: suppliers.name,
      totalAmount: warehouseReceipts.totalAmount,
      shippingCost: warehouseReceipts.shippingCost,
      laborCost: warehouseReceipts.laborCost,
      createdAt: warehouseReceipts.createdAt,
      itemCount: sql<number>`COUNT(${productBatches.id})`.mapWith(Number),
    })
    .from(warehouseReceipts)
    .leftJoin(suppliers, eq(warehouseReceipts.supplierId, suppliers.id))
    .leftJoin(productBatches, eq(productBatches.receiptId, warehouseReceipts.id))
    .where(
      and(
        gte(warehouseReceipts.createdAt, fromDate),
        lte(warehouseReceipts.createdAt, toDate)
      )
    )
    .groupBy(
      warehouseReceipts.id,
      warehouseReceipts.receiptCode,
      suppliers.name,
      warehouseReceipts.totalAmount,
      warehouseReceipts.shippingCost,
      warehouseReceipts.laborCost,
      warehouseReceipts.createdAt
    )
    .orderBy(warehouseReceipts.createdAt);

  return rows.map((r) => ({
    ...r,
    totalAmount: r.totalAmount ?? "0",
    shippingCost: r.shippingCost ?? "0",
    laborCost: r.laborCost ?? "0",
    supplierName: r.supplierName ?? null,
  }));
}

// ──────────────────────────────────────────────
// Lấy bảng giá sản phẩm
// ──────────────────────────────────────────────
export async function getPriceListAction(): Promise<PriceListRow[]> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      imageUrl: products.imageUrl,
      currentPrice: products.currentPrice,
      minPrice: products.minPrice,
      maxPrice: products.maxPrice,
      totalStock: sql<number>`COALESCE(SUM(${productBatches.remainingQuantity}), 0)`.mapWith(Number),
    })
    .from(products)
    .leftJoin(productBatches, eq(products.id, productBatches.productId))
    .where(sql`${products.status} != 'archived'`)
    .groupBy(
      products.id,
      products.name,
      products.imageUrl,
      products.currentPrice,
      products.minPrice,
      products.maxPrice
    )
    .orderBy(products.name);

  return rows.map((r) => ({
    ...r,
    currentPrice: r.currentPrice ?? "0",
    minPrice: r.minPrice ?? "0",
    maxPrice: r.maxPrice ?? "0",
  }));
}
