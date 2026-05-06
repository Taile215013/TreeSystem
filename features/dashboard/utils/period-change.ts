function changeRatio(previous: number, current: number): number | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/** Dùng cho thẻ KPI: không hiển thị % ảo khi không có mốc so sánh. */
export function formatPeriodChange(previous: number, current: number): {
  changePercent: number | null;
  isNewActivity: boolean;
} {
  const isNewActivity = previous === 0 && current > 0;
  return {
    changePercent: changeRatio(previous, current),
    isNewActivity,
  };
}
