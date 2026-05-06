import { pgTable, serial, text, integer, timestamp, decimal, varchar, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- ENUMS & Cấu hình ---
export const stockChangeReasonEnum = pgEnum("stock_change_reason", ["import", "sale", "damaged", "return", "adjustment"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "canceled"]);
export const productStatusEnum = pgEnum("product_status", ["active", "draft", "archived"]);


export const waterNeedEnum = pgEnum("water_need", ["Low", "Medium", "High", "Aquatic"]); 
// Thủy sinh = Aquatic

export const environmentEnum = pgEnum("environment", ["Outdoor", "Indoor", "Hybrid"]); 
// Ngoài trời, Trong nhà, Cả hai

export const plantTypeEnum = pgEnum("plant_type", ["Flower", "Leaf", "Fruit"]); 
// Hoa, Lá, Ăn trái


// --- 1. DANH MỤC & NHÀ CUNG CẤP ---
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  productBatches: many(productBatches),
}));

// --- 2. SẢN PHẨM & GIÁ ---
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),

  // --- Các trường mới thêm ---
  waterNeed: waterNeedEnum("water_need").default("Medium"),
  environment: environmentEnum("environment").default("Indoor"),
  plantType: plantTypeEnum("plant_type").default("Leaf"),
  // ---------------------------


  imageUrl: text("image_url"),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }), // Nếu xóa DM, SP không bị xóa
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  minPrice: decimal("min_price", { precision: 10, scale: 2 }).default("0.00"),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }).default("0.00"),
  status: productStatusEnum("status").default("active"),

  // --- Kích thước và thông số mới ---
  potSize: varchar("pot_size", { length: 100 }),
  height: varchar("height", { length: 100 }),
  diameter: varchar("diameter", { length: 100 }),
  // ----------------------------------

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  batches: many(productBatches),
  orderItems: many(orderItems),
  stockLogs: many(stockLogs),
}));

// --- 3. QUẢN LÝ KHO (WMS) ---
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const locationsRelations = relations(locations, ({ many }) => ({
  productBatches: many(productBatches),
}));

export const warehouseReceipts = pgTable("warehouse_receipts", {
  id: serial("id").primaryKey(),
  receiptCode: varchar("receipt_code", { length: 50 }).unique().notNull(), // VD: NK-20240420-001
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0.00"),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0.00"), // Tổng tiền hàng trong phiếu
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const warehouseReceiptsRelations = relations(warehouseReceipts, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [warehouseReceipts.supplierId],
    references: [suppliers.id],
  }),
  batches: many(productBatches),
}));

export const productBatches = pgTable("product_batches", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  receiptId: integer("receipt_id").references(() => warehouseReceipts.id, { onDelete: "cascade" }),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  locationId: integer("location_id").references(() => locations.id, { onDelete: "set null" }),
  importPrice: decimal("import_price", { precision: 10, scale: 2 }).notNull(),
  originalQuantity: integer("original_quantity").notNull(),
  remainingQuantity: integer("remaining_quantity").notNull(),
  
  unit: varchar("unit", { length: 50 }),
  notes: text("notes"),
  
  batchDate: timestamp("batch_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

// --- 5. CHI PHÍ VẬN HÀNH (Hàng tháng & Phát sinh) ---
export const expenseTypeEnum = pgEnum("expense_type", ["fixed", "variable"]);
export const paymentStatusEnum = pgEnum("payment_status", ["paid", "pending"]);
export const monthlyExpenseCategoryEnum = pgEnum("expense_category", [
  "electric", 
  "water", 
  "internet", 
  "food", 
  "fuel", 
  "salary_fixed", 
  "salary_parttime", 
  "rent", 
  "marketing", 
  "maintenance", 
  "other"
]);

export const monthlyExpenses = pgTable("monthly_expenses", {
  id: serial("id").primaryKey(),
  category: monthlyExpenseCategoryEnum("category").notNull(),
  type: expenseTypeEnum("type").default("variable").notNull(),
  status: paymentStatusEnum("status").default("paid").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: timestamp("expense_date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productBatchesRelations = relations(productBatches, ({ one, many }) => ({
  product: one(products, {
    fields: [productBatches.productId],
    references: [products.id],
  }),
  receipt: one(warehouseReceipts, {
    fields: [productBatches.receiptId],
    references: [warehouseReceipts.id],
  }),
  supplier: one(suppliers, {
    fields: [productBatches.supplierId],
    references: [suppliers.id],
  }),
  location: one(locations, {
    fields: [productBatches.locationId],
    references: [locations.id],
  }),
  orderItems: many(orderItems),
  stockLogs: many(stockLogs),
}));

export const stockLogs = pgTable("stock_logs", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  batchId: integer("batch_id").references(() => productBatches.id, { onDelete: "cascade" }),
  changeAmount: integer("change_amount").notNull(),
  reason: stockChangeReasonEnum("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stockLogsRelations = relations(stockLogs, ({ one }) => ({
  product: one(products, {
    fields: [stockLogs.productId],
    references: [products.id],
  }),
  batch: one(productBatches, {
    fields: [stockLogs.batchId],
    references: [productBatches.id],
  }),
}));

// --- 4. NGƯỜI DÙNG & ĐƠN HÀNG ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  fullName: varchar("full_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  bio: text("bio"),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default("cash").notNull(),
  status: orderStatusEnum("status").default("pending"),
  orderDate: timestamp("order_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id, { onDelete: "restrict" }).notNull(),
  batchId: integer("batch_id").references(() => productBatches.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  batch: one(productBatches, {
    fields: [orderItems.batchId],
    references: [productBatches.id],
  }),
}))