"use server";

import { dashboardService } from "../services/dashboard.service";

/**
 * Lấy toàn bộ dữ liệu cho Dashboard
 */
export async function getDashboardDataAction() {
  try {
    const [metrics, chartData, insights] = await Promise.all([
      dashboardService.getMetrics(),
      dashboardService.getChartData(),
      dashboardService.getInsights(),
    ]);

    return {
      success: true,
      data: {
        metrics,
        chartData,
        insights,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu Dashboard:", error);
    return {
      success: false,
      message: "Không thể tải dữ liệu thống kê",
      data: null
    };
  }
}
