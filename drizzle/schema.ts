import { pgTable, foreignKey, serial, integer, numeric, timestamp, varchar, text, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const environment = pgEnum("environment", ['Outdoor', 'Indoor', 'Hybrid'])
export const expenseCategory = pgEnum("expense_category", ['electric', 'water', 'internet', 'food', 'fuel', 'salary_fixed', 'salary_parttime', 'rent', 'marketing', 'maintenance', 'other'])
export const expenseType = pgEnum("expense_type", ['fixed', 'variable'])
export const orderStatus = pgEnum("order_status", ['pending', 'processing', 'shipped', 'delivered', 'canceled'])
export const paymentStatus = pgEnum("payment_status", ['paid', 'pending'])
export const plantType = pgEnum("plant_type", ['Flower', 'Leaf', 'Fruit'])
export const productStatus = pgEnum("product_status", ['active', 'draft', 'archived'])
export const stockChangeReason = pgEnum("stock_change_reason", ['import', 'sale', 'damaged', 'return', 'adjustment'])
export const supplierType = pgEnum("supplier_type", ['garden', 'provider'])
export const userRole = pgEnum("user_role", ['admin', 'staff', 'customer'])
export const waterNeed = pgEnum("water_need", ['Low', 'Medium', 'High', 'Aquatic'])


export const productBatches = pgTable("product_batches", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	supplierId: integer("supplier_id"),
	locationId: integer("location_id"),
	importPrice: numeric("import_price", { precision: 10, scale:  2 }).notNull(),
	originalQuantity: integer("original_quantity").notNull(),
	remainingQuantity: integer("remaining_quantity").notNull(),
	batchDate: timestamp("batch_date", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	receiptId: integer("receipt_id"),
	unit: varchar({ length: 50 }),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_batches_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "product_batches_supplier_id_suppliers_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [locations.id],
			name: "product_batches_location_id_locations_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.receiptId],
			foreignColumns: [warehouseReceipts.id],
			name: "product_batches_receipt_id_warehouse_receipts_id_fk"
		}).onDelete("cascade"),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	totalPrice: numeric("total_price", { precision: 10, scale:  2 }).notNull(),
	status: orderStatus().default('pending'),
	orderDate: timestamp("order_date", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	paymentMethod: varchar("payment_method", { length: 50 }).default('cash').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const locations = pgTable("locations", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const suppliers = pgTable("suppliers", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 20 }),
	address: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	imageUrl: text("image_url"),
	specifications: text(),
	type: supplierType().default('garden'),
});

export const orderItems = pgTable("order_items", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	productId: integer("product_id").notNull(),
	batchId: integer("batch_id"),
	quantity: integer().notNull(),
	salePrice: numeric("sale_price", { precision: 10, scale:  2 }).notNull(),
	costPrice: numeric("cost_price", { precision: 10, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.batchId],
			foreignColumns: [productBatches.id],
			name: "order_items_batch_id_product_batches_id_fk"
		}).onDelete("restrict"),
]);

export const stockLogs = pgTable("stock_logs", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	batchId: integer("batch_id"),
	changeAmount: integer("change_amount").notNull(),
	reason: stockChangeReason().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "stock_logs_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.batchId],
			foreignColumns: [productBatches.id],
			name: "stock_logs_batch_id_product_batches_id_fk"
		}).onDelete("cascade"),
]);

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("categories_slug_unique").on(table.slug),
]);

export const monthlyExpenses = pgTable("monthly_expenses", {
	id: serial().primaryKey().notNull(),
	category: expenseCategory().notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	expenseDate: timestamp("expense_date", { mode: 'string' }).defaultNow().notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	type: expenseType().default('variable').notNull(),
	status: paymentStatus().default('paid').notNull(),
});

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	currentPrice: numeric("current_price", { precision: 10, scale:  2 }).default('0.00').notNull(),
	description: text(),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	slug: varchar({ length: 255 }).notNull(),
	categoryId: integer("category_id"),
	status: productStatus().default('active'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	waterNeed: waterNeed("water_need").default('Medium'),
	environment: environment().default('Indoor'),
	plantType: plantType("plant_type").default('Leaf'),
	potSize: varchar("pot_size", { length: 100 }),
	height: varchar({ length: 100 }),
	diameter: varchar({ length: 100 }),
	minPrice: numeric("min_price", { precision: 10, scale:  2 }).default('0.00'),
	maxPrice: numeric("max_price", { precision: 10, scale:  2 }).default('0.00'),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_categories_id_fk"
		}).onDelete("set null"),
	unique("products_slug_unique").on(table.slug),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	email: varchar({ length: 255 }),
	fullName: varchar("full_name", { length: 255 }),
	username: varchar({ length: 255 }),
	passwordHash: varchar({ length: 255 }).notNull(),
	avatarUrl: text("avatar_url"),
	coverUrl: text("cover_url"),
	bio: text(),
	role: userRole().default('customer').notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_username_unique").on(table.username),
]);

export const warehouseReceipts = pgTable("warehouse_receipts", {
	id: serial().primaryKey().notNull(),
	receiptCode: varchar("receipt_code", { length: 50 }).notNull(),
	supplierId: integer("supplier_id"),
	shippingCost: numeric("shipping_cost", { precision: 10, scale:  2 }).default('0.00'),
	laborCost: numeric("labor_cost", { precision: 10, scale:  2 }).default('0.00'),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).default('0.00'),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "warehouse_receipts_supplier_id_suppliers_id_fk"
		}).onDelete("set null"),
	unique("warehouse_receipts_receipt_code_unique").on(table.receiptCode),
]);
