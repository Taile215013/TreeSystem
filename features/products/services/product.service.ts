import { db } from "@/db";
import { products, productBatches, categories, suppliers } from "@/db/schema";
import { eq, ilike, desc, sql, and, ne, isNull, inArray } from "drizzle-orm";
import { CreateProductInput, UpdateProductInput } from "../schemas/product.schema";

export const productService = {
  // Lấy danh sách sản phẩm kèm tổng tồn kho và thông tin nhà cung cấp gần nhất
  async getAll(searchQuery?: string, limit = 500, offset = 0) {
    const conditions = [isNull(products.deletedAt), ne(products.status, "archived")];
    if (searchQuery) conditions.push(ilike(products.name, `%${searchQuery}%`));

    // Lấy thông tin NCC mới nhất từ lô hàng gần nhất bằng Window Function
    const latestBatchSupplierSub = db
      .select({
        productId: productBatches.productId,
        supplierId: productBatches.supplierId,
        rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${productBatches.productId} ORDER BY ${productBatches.createdAt} DESC)`.as("rn"),
      })
      .from(productBatches)
      .as("batches_with_rn");

    const latestSupplierSub = db
      .select({
        productId: latestBatchSupplierSub.productId,
        supplierId: latestBatchSupplierSub.supplierId,
      })
      .from(latestBatchSupplierSub)
      .where(eq(latestBatchSupplierSub.rn, 1))
      .as("latest_supplier_sub");

    const rows = await db
      .select({
        product: products,
        category: categories,
        supplier: {
          id: suppliers.id,
          name: suppliers.name,
          imageUrl: suppliers.imageUrl,
          specifications: suppliers.specifications,
        },
        totalStock: sql<number>`COALESCE(SUM(${productBatches.remainingQuantity}), 0)`.mapWith(Number),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productBatches, eq(products.id, productBatches.productId))
      .leftJoin(latestSupplierSub, eq(products.id, latestSupplierSub.productId))
      .leftJoin(suppliers, eq(latestSupplierSub.supplierId, suppliers.id))
      .where(and(...conditions))
      .groupBy(products.id, categories.id, suppliers.id)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    // Map lại format để UI dễ dùng
    return rows.map(row => ({
      ...row.product,
      category: row.category,
      supplier: row.supplier,
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
    const slug = data.slug || data.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
      .replace(/[^\w ]+/g, '') // Bỏ ký tự đặc biệt
      .replace(/ +/g, '-'); // Thay khoảng trắng bằng -

    const [newProduct] = await db
      .insert(products)
      .values({
        ...data,
        slug: slug,
      })
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
  async delete(id: number, mode: "trash" | "permanent" = "trash") {
    if (mode === "permanent") {
      const [deleted] = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning();
      return deleted;
    }

    // Xóa mềm (Soft delete) - Đưa vào thùng rác
    const [archived] = await db
      .update(products)
      .set({ 
        deletedAt: new Date(),
        status: "archived" 
      })
      .where(eq(products.id, id))
      .returning();
    return archived;
  },

  // Xóa nhiều sản phẩm
  async bulkDelete(ids: number[], mode: "trash" | "permanent" = "trash") {
    if (mode === "permanent") {
      return await db
        .delete(products)
        .where(inArray(products.id, ids))
        .returning();
    }

    return await db
      .update(products)
      .set({ 
        deletedAt: new Date(),
        status: "archived" 
      })
      .where(inArray(products.id, ids))
      .returning();
  },
};

