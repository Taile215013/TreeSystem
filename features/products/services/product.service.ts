import { db } from "@/db";
import { products, productBatches, categories } from "@/db/schema";
import { eq, ilike, desc, sql } from "drizzle-orm";
import { CreateProductInput, UpdateProductInput } from "../schemas/product.schema";

export const productService = {
  // Lấy danh sách sản phẩm kèm tổng tồn kho
  async getAll(searchQuery?: string, limit = 10, offset = 0) {
    const rows = await db
      .select({
        product: products,
        category: categories,
        totalStock: sql<number>`COALESCE(SUM(${productBatches.remainingQuantity}), 0)`.mapWith(Number),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productBatches, eq(products.id, productBatches.productId))
      .where(searchQuery ? ilike(products.name, `%${searchQuery}%`) : undefined)
      .groupBy(products.id, categories.id)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    // Map lại format để UI dễ dùng
    return rows.map(row => ({
      ...row.product,
      category: row.category,
      totalStock: row.totalStock,
    }));
  },

  // Lấy chi tiết một sản phẩm
  async getById(id: number) {
    return await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
      },
    });
  },

  // Lấy sản phẩm theo Slug (để kiểm tra trùng lặp)
  async getBySlug(slug: string) {
    return await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
  },

  // Thêm mới sản phẩm
  async create(data: CreateProductInput) {
    // Drizzle cần data khớp với schema trong DB, tuỳ vào thư viện validate bạn dùng.
    const [newProduct] = await db
      .insert(products)
      .values(data)
      .returning();
    return newProduct;
  },

  // Cập nhật sản phẩm
  async update(id: number, data: UpdateProductInput) {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return updatedProduct;
  },

  // Xóa sản phẩm
  async delete(id: number) {
    // Chuyển sang xóa mềm (Soft delete) đổi status thành archived thay vì xóa cứng
    const [deleted] = await db
      .update(products)
      .set({ status: "archived" })
      .where(eq(products.id, id))
      .returning();

    // Hoặc xóa hẳn (Hard delete): await db.delete(products).where(eq(products.id, id));
    return deleted;
  },
};
