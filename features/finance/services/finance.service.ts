import { db } from "@/db";
import { monthlyExpenses, orders, orderItems, products } from "@/db/schema";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import { startOfMonth, endOfMonth, format, startOfDay, endOfDay } from "date-fns";

export const financeService = {
  /**
   * Tính toán báo cáo tài chính tổng quát
   */
  async getFinanceSummary(month?: Date) {
    const targetDate = month || new Date();
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    // 1. Tổng doanh thu (Revenue)
    const revenueResult = await db
      .select({ total: sql<number>`sum(cast(${orders.totalPrice} as decimal))` })
      .from(orders)
      .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end)));
    
    const revenue = Number(revenueResult[0]?.total || 0);

    // 2. Giá vốn hàng bán (COGS)
    // Tính từ chi tiết các đơn hàng trong tháng
    const cogsResult = await db
      .select({ 
        total: sql<number>`sum(cast(${orderItems.costPrice} as decimal) * ${orderItems.quantity})` 
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end)));
    
    const cogs = Number(cogsResult[0]?.total || 0);

    // 3. Chi phí vận hành (Operational Expenses)
    const expensesResult = await db
      .select({ 
        total: sql<number>`sum(cast(${monthlyExpenses.amount} as decimal))`,
        pending: sql<number>`sum(case when ${monthlyExpenses.status} = 'pending' then cast(${monthlyExpenses.amount} as decimal) else 0 end)`
      })
      .from(monthlyExpenses)
      .where(and(gte(monthlyExpenses.expenseDate, start), lte(monthlyExpenses.expenseDate, end)));
    
    const totalExpenses = Number(expensesResult[0]?.total || 0);
    const pendingExpenses = Number(expensesResult[0]?.pending || 0);

    // 4. Lợi nhuận gộp & Lợi nhuận ròng
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - totalExpenses;

    return {
      revenue,
      cogs,
      totalExpenses,
      pendingExpenses,
      grossProfit,
      netProfit,
      monthName: format(targetDate, 'MM/yyyy')
    };
  },

  /**
   * Lấy danh sách chi phí gần đây
   */
  async getRecentExpenses(limit = 10) {
    return await db
      .select()
      .from(monthlyExpenses)
      .orderBy(desc(monthlyExpenses.expenseDate))
      .limit(limit);
  },

  /**
   * Phân bổ chi phí theo danh mục
   */
  async getExpenseBreakdown(month?: Date) {
    const targetDate = month || new Date();
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    return await db
      .select({
        category: monthlyExpenses.category,
        total: sql<number>`sum(cast(${monthlyExpenses.amount} as decimal))`
      })
      .from(monthlyExpenses)
      .where(and(gte(monthlyExpenses.expenseDate, start), lte(monthlyExpenses.expenseDate, end)))
      .groupBy(monthlyExpenses.category);
  },

  /**
   * Báo cáo doanh số hằng ngày chi tiết theo phương thức thanh toán
   */
  async getDailySalesSummary(date?: Date) {
    const targetDate = date || new Date();
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    // 1. Lấy tất cả đơn hàng trong ngày
    const todayOrders = await db
      .select()
      .from(orders)
      .where(and(gte(orders.orderDate, start), lte(orders.orderDate, end)))
      .orderBy(desc(orders.orderDate));

    // 2. Tính tổng theo từng loại
    const summary = {
      cash: 0,
      bank_transfer: 0,
      cod: 0,
      total: 0
    };

    todayOrders.forEach(order => {
      const amount = Number(order.totalPrice);
      summary.total += amount;
      
      if (order.paymentMethod === 'bank_transfer') summary.bank_transfer += amount;
      else if (order.paymentMethod === 'cod') summary.cod += amount;
      else summary.cash += amount; // Mặc định là cash
    });

    return {
      summary,
      orders: todayOrders,
      dateFormatted: format(targetDate, 'dd/MM/yyyy')
    };
  }
};
