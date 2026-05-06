import { db } from "@/db";
import { products, productBatches, warehouseReceipts, categories } from "@/db/schema";
import { eq, gt, and, sql } from "drizzle-orm";

export const inventoryService = {
  /**
   * Lấy tồn kho chi tiết theo từng lô hàng (toa hàng)
   */
  async getInventoryData() {
    const data = await db.query.products.findMany({
      with: {
        category: true,
        batches: {
          where: (batches, { gt }) => gt(batches.remainingQuantity, 0),
          with: {
            receipt: true,
            location: true,
          },
          orderBy: (batches, { desc }) => [desc(batches.createdAt)],
        },
      },
    });

    // Xử lý dữ liệu để tính toán thông số tổng quan cho từng sản phẩm
    return data.map(product => {
      const activeBatches = product.batches || [];
      const totalQuantity = activeBatches.reduce((acc, b) => acc + b.remainingQuantity, 0);
      
      // Lấy khoảng giá nhập (Min - Max)
      const prices = activeBatches.map(b => Number(b.importPrice));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      return {
        ...product,
        totalQuantity,
        priceRange: {
          min: minPrice,
          max: maxPrice,
          isVariable: minPrice !== maxPrice
        },
        batches: activeBatches.map(b => ({
          id: b.id,
          receiptCode: b.receipt?.receiptCode || "N/A",
          importPrice: Number(b.importPrice),
          originalQuantity: b.originalQuantity,
          remainingQuantity: b.remainingQuantity,
          locationName: b.location?.name || "Chưa rõ",
          importDate: b.createdAt
        }))
      };
    }).filter(p => p.batches.length > 0); // Chỉ hiện sản phẩm còn hàng
  }
};
