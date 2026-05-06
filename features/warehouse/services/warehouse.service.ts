import { db } from "@/db";
import { 
  warehouseReceipts, 
  productBatches, 
  stockLogs, 
  products, 
  locations, 
  suppliers 
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateReceiptInput } from "../schemas/warehouse.schema";

export const warehouseService = {
  /**
   * Lấy dữ liệu cần thiết cho Form nhập kho
   */
  async getFormData() {
    const [allProducts, allLocations, allSuppliers] = await Promise.all([
      db.query.products.findMany({
        where: (products, { ne }) => ne(products.status, "archived"),
        with: {
          category: true
        }
      }),
      db.query.locations.findMany(),
      db.query.suppliers.findMany()
    ]);

    // Nếu chưa có vị trí nào, tạo mặc định 1 cái
    let activeLocations = allLocations;
    if (allLocations.length === 0) {
      const [defaultLoc] = await db.insert(locations).values({
        name: "Kho chính",
        description: "Vị trí lưu trữ mặc định"
      }).returning();
      activeLocations = [defaultLoc];
    }

    return {
      products: allProducts,
      locations: activeLocations,
      suppliers: allSuppliers
    };
  },

  /**
   * Tạo Phiếu Nhập Kho và các Lô hàng đi kèm (Transaction)
   */
  async createReceipt(data: CreateReceiptInput) {
    return await db.transaction(async (tx) => {
      // 1. Tính tổng tiền hàng
      const totalAmountValue = data.items.reduce(
        (sum, item) => sum + item.importPrice * item.quantity, 
        0
      );

      // 2. Tạo Phiếu Nhập Kho (Receipt)
      const [receipt] = await tx.insert(warehouseReceipts).values({
        receiptCode: data.receiptCode,
        supplierId: data.supplierId,
        shippingCost: String(data.shippingCost),
        laborCost: String(data.laborCost),
        totalAmount: String(totalAmountValue),
        notes: data.notes,
      }).returning();

      // 3. Xử lý từng sản phẩm trong lô
      for (const item of data.items) {
        // 3.1 Tạo Lô hàng (Batch)
        const [batch] = await tx.insert(productBatches).values({
          productId: item.productId,
          receiptId: receipt.id,
          // Ưu tiên NCC của từng món, nếu không có mới dùng NCC chung của phiếu
          supplierId: item.supplierId || data.supplierId,
          locationId: data.locationId,
          importPrice: String(item.importPrice),
          originalQuantity: item.quantity,
          remainingQuantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
        }).returning();

        // 3.2 Ghi Log kho (Stock Log)
        await tx.insert(stockLogs).values({
          productId: item.productId,
          batchId: batch.id,
          changeAmount: item.quantity,
          reason: "import",
        });

        // 3.3 [Pro Logic] Cập nhật giá bán hiện tại và khoảng giá Min/Max của sản phẩm
        // Chúng ta cập nhật các loại giá mới nhất vào products table để tiện quản lý và hiển thị
        await tx.update(products).set({
          currentPrice: String(item.importPrice),
          // Nếu minPrice gửi lên là 0 hoặc null, lấy giá nhập làm giá min
          minPrice: String(item.minPrice || item.importPrice),
          maxPrice: String(item.maxPrice),
          updatedAt: new Date()
        }).where(eq(products.id, item.productId));
      }

      return receipt;
    });
  },

  /**
   * Lấy lịch sử các phiếu nhập kho gần đây
   */
  async getRecentReceipts(limit = 10) {
    return await db.query.warehouseReceipts.findMany({
      orderBy: (receipts, { desc }) => [desc(receipts.createdAt)],
      limit: limit,
      with: {
        supplier: true,
        batches: {
          with: {
            product: true
          }
        }
      }
    });
  }
};
