import { relations } from "drizzle-orm/relations";
import { products, productBatches, suppliers, locations, warehouseReceipts, users, orders, orderItems, stockLogs, categories } from "./schema";

export const productBatchesRelations = relations(productBatches, ({one, many}) => ({
	product: one(products, {
		fields: [productBatches.productId],
		references: [products.id]
	}),
	supplier: one(suppliers, {
		fields: [productBatches.supplierId],
		references: [suppliers.id]
	}),
	location: one(locations, {
		fields: [productBatches.locationId],
		references: [locations.id]
	}),
	warehouseReceipt: one(warehouseReceipts, {
		fields: [productBatches.receiptId],
		references: [warehouseReceipts.id]
	}),
	orderItems: many(orderItems),
	stockLogs: many(stockLogs),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productBatches: many(productBatches),
	orderItems: many(orderItems),
	stockLogs: many(stockLogs),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
}));

export const suppliersRelations = relations(suppliers, ({many}) => ({
	productBatches: many(productBatches),
	warehouseReceipts: many(warehouseReceipts),
}));

export const locationsRelations = relations(locations, ({many}) => ({
	productBatches: many(productBatches),
}));

export const warehouseReceiptsRelations = relations(warehouseReceipts, ({one, many}) => ({
	productBatches: many(productBatches),
	supplier: one(suppliers, {
		fields: [warehouseReceipts.supplierId],
		references: [suppliers.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	orderItems: many(orderItems),
}));

export const usersRelations = relations(users, ({many}) => ({
	orders: many(orders),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
	productBatch: one(productBatches, {
		fields: [orderItems.batchId],
		references: [productBatches.id]
	}),
}));

export const stockLogsRelations = relations(stockLogs, ({one}) => ({
	product: one(products, {
		fields: [stockLogs.productId],
		references: [products.id]
	}),
	productBatch: one(productBatches, {
		fields: [stockLogs.batchId],
		references: [productBatches.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));