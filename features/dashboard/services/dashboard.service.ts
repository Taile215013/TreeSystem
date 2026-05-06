import { db } from "@/db";
import {
  orders,
  orderItems,
  warehouseReceipts,
  monthlyExpenses,
  products,
  productBatches,
} from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import type {
  DashboardChartPoint,
  DashboardInsights,
  DashboardMetrics,
} from "../types/dashboard.types";

export const dashboardService = {
  /**
   * Chỉ số tổng hợp toàn thời gian (cùng định nghĩa trước đây).
   */
  async getMetrics(): Promise<DashboardMetrics> {
    const revenueQuery = await db
      .select({ total: sql<number>`COALESCE(SUM(${orders.totalPrice}::numeric), 0)`.mapWith(Number) })
      .from(orders);
    const totalRevenue = revenueQuery[0]?.total ?? 0;

    const cogsQuery = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orderItems.costPrice}::numeric * ${orderItems.quantity}), 0)`.mapWith(
          Number
        ),
      })
      .from(orderItems);
    const totalCOGS = cogsQuery[0]?.total ?? 0;

    const receiptExpensesQuery = await db
      .select({
        shipping: sql<number>`COALESCE(SUM(${warehouseReceipts.shippingCost}::numeric), 0)`.mapWith(Number),
        labor: sql<number>`COALESCE(SUM(${warehouseReceipts.laborCost}::numeric), 0)`.mapWith(Number),
      })
      .from(warehouseReceipts);
    const shippingBatchTotal = receiptExpensesQuery[0]?.shipping ?? 0;
    const laborBatchTotal = receiptExpensesQuery[0]?.labor ?? 0;

    const monthlyExpensesQuery = await db
      .select({ total: sql<number>`COALESCE(SUM(${monthlyExpenses.amount}::numeric), 0)`.mapWith(Number) })
      .from(monthlyExpenses);
    const totalMonthlyExpenses = monthlyExpensesQuery[0]?.total ?? 0;

    const stockQuery = await db
      .select({
        totalPlants: sql<number>`COALESCE(SUM(${productBatches.remainingQuantity}), 0)`.mapWith(Number),
        countProducts: sql<number>`COUNT(DISTINCT ${products.id})::int`.mapWith(Number),
      })
      .from(products)
      .leftJoin(productBatches, eq(products.id, productBatches.productId));
    const totalStock = stockQuery[0]?.totalPlants ?? 0;
    const productCount = stockQuery[0]?.countProducts ?? 0;

    const netProfit =
      totalRevenue - totalCOGS - shippingBatchTotal - laborBatchTotal - totalMonthlyExpenses;

    return {
      totalRevenue,
      totalCOGS,
      totalExpenses: shippingBatchTotal + laborBatchTotal + totalMonthlyExpenses,
      netProfit,
      totalStock,
      productCount,
    };
  },

  /**
   * Doanh thu & lợi nhuận gộp theo từng ngày (7 ngày gần nhất), từ đơn hàng thật.
   */
  async getChartData(): Promise<DashboardChartPoint[]> {
    const today = new Date();
    const windowStart = startOfDay(subDays(today, 6));
    const windowEnd = endOfDay(today);

    const revenueByDay = await db
      .select({
        dateKey: sql<string>`to_char(date_trunc('day', ${orders.orderDate}), 'YYYY-MM-DD')`.as("date_key"),
        revenue: sql<number>`COALESCE(SUM(${orders.totalPrice}::numeric), 0)`.mapWith(Number),
      })
      .from(orders)
      .where(and(gte(orders.orderDate, windowStart), lte(orders.orderDate, windowEnd)))
      .groupBy(sql`date_trunc('day', ${orders.orderDate})`);

    const cogsByDay = await db
      .select({
        dateKey: sql<string>`to_char(date_trunc('day', ${orders.orderDate}), 'YYYY-MM-DD')`.as("date_key"),
        cogs: sql<number>`COALESCE(SUM(${orderItems.costPrice}::numeric * ${orderItems.quantity}), 0)`.mapWith(
          Number
        ),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(gte(orders.orderDate, windowStart), lte(orders.orderDate, windowEnd)))
      .groupBy(sql`date_trunc('day', ${orders.orderDate})`);

    const revenueMap = new Map(revenueByDay.map((r) => [r.dateKey, r.revenue]));
    const cogsMap = new Map(cogsByDay.map((r) => [r.dateKey, r.cogs]));

    const days = eachDayOfInterval({ start: windowStart, end: windowEnd });

    return days.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const revenue = revenueMap.get(dateKey) ?? 0;
      const cogs = cogsMap.get(dateKey) ?? 0;
      return {
        dateKey,
        name: format(day, "EEE", { locale: viLocale }),
        revenue,
        grossProfit: revenue - cogs,
      };
    });
  },

  /**
   * So sánh 7 ngày gần nhất vs 7 ngày liền trước (doanh thu & lợi nhuận gộp từ đơn).
   */
  async getInsights(): Promise<DashboardInsights> {
    const today = new Date();

    const curStart = startOfDay(subDays(today, 6));
    const curEnd = endOfDay(today);

    const prevStart = startOfDay(subDays(today, 13));
    const prevEnd = endOfDay(subDays(today, 7));

    const [curRev, prevRev, curCogs, prevCogs] = await Promise.all([
      sumOrderRevenueBetween(curStart, curEnd),
      sumOrderRevenueBetween(prevStart, prevEnd),
      sumOrderCogsBetween(curStart, curEnd),
      sumOrderCogsBetween(prevStart, prevEnd),
    ]);

    return {
      revenue: { current: curRev, previous: prevRev },
      grossProfit: {
        current: curRev - curCogs,
        previous: prevRev - prevCogs,
      },
    };
  },
};

async function sumOrderRevenueBetween(from: Date, to: Date): Promise<number> {
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${orders.totalPrice}::numeric), 0)`.mapWith(Number),
    })
    .from(orders)
    .where(and(gte(orders.orderDate, from), lte(orders.orderDate, to)));
  return row?.total ?? 0;
}

async function sumOrderCogsBetween(from: Date, to: Date): Promise<number> {
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${orderItems.costPrice}::numeric * ${orderItems.quantity}), 0)`.mapWith(
        Number
      ),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(gte(orders.orderDate, from), lte(orders.orderDate, to)));
  return row?.total ?? 0;
}
