import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export const categoryService = {
  async listWithProductCount() {
    return db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        createdAt: categories.createdAt,
        productCount: sql<number>`COUNT(${products.id})::int`.mapWith(Number),
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(asc(categories.name));
  },
};
