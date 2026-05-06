/** Một điểm trên biểu đồ doanh thu theo ngày (dữ liệu thật từ DB). */
export type DashboardChartPoint = {
  /** Nhãn trục X (ngắn, theo locale). */
  name: string;
  /** ISO date yyyy-MM-dd — để debug / tooltip nâng cao. */
  dateKey: string;
  revenue: number;
  /** Doanh thu − giá vốn (COGS) của đơn trong ngày; không trừ chi phí cố định tháng. */
  grossProfit: number;
};

export type PeriodTotals = {
  current: number;
  previous: number;
};

export type DashboardInsights = {
  /** So sánh 7 ngày gần nhất vs 7 ngày trước đó. */
  revenue: PeriodTotals;
  grossProfit: PeriodTotals;
};

export type DashboardMetrics = {
  totalRevenue: number;
  totalCOGS: number;
  totalExpenses: number;
  netProfit: number;
  totalStock: number;
  productCount: number;
};

export type DashboardData = {
  metrics: DashboardMetrics;
  chartData: DashboardChartPoint[];
  insights: DashboardInsights;
};
