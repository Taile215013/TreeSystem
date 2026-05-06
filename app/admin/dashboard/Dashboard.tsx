"use client";

import {
  TrendingUp,
  Package,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Layers,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import type { DashboardData } from "@/features/dashboard/types/dashboard.types";
import { formatPeriodChange } from "@/features/dashboard/utils/period-change";

function formatVnd(n: number): string {
  return `${n.toLocaleString("vi-VN")}đ`;
}

function SevenDayComparisonFooter({
  label,
  current,
  previous,
}: {
  label: string;
  current: number;
  previous: number;
}) {
  const { changePercent, isNewActivity } = formatPeriodChange(previous, current);

  if (changePercent !== null) {
    const up = changePercent >= 0;
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">{formatVnd(current)}</span>
        <span
          className={`inline-flex items-center gap-0.5 font-semibold tabular-nums ${
            up ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
          }`}
        >
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {`${up ? "+" : ""}${changePercent.toFixed(1)}%`}
        </span>
        <span className="text-muted-foreground">so với 7 ngày trước</span>
      </div>
    );
  }

  if (isNewActivity) {
    return (
      <p className="text-xs text-muted-foreground">
        {label} <span className="font-medium text-foreground">{formatVnd(current)}</span> — kỳ trước chưa có
        phát sinh.
      </p>
    );
  }

  return (
    <p className="text-xs text-muted-foreground">
      {label}: {formatVnd(current)} — chưa có mốc so sánh (cả hai kỳ gần như không có dữ liệu).
    </p>
  );
}

export default function DashboardContent({ data }: { data: DashboardData }) {
  const { metrics, chartData, insights } = data;
  const { isDark } = useTheme();

  const stats = [
    {
      title: "Tổng doanh thu",
      value: formatVnd(metrics.totalRevenue),
      description: "Luỹ kế từ tất cả đơn hàng",
      icon: DollarSign,
      accent: "text-emerald-600 dark:text-emerald-500",
      iconBg: "bg-emerald-500/10",
      footer: (
        <SevenDayComparisonFooter
          label="7 ngày gần nhất"
          current={insights.revenue.current}
          previous={insights.revenue.previous}
        />
      ),
    },
    {
      title: "Lợi nhuận ròng",
      value: formatVnd(metrics.netProfit),
      description: "Luỹ kế sau COGS, chi phí nhập & chi hàng tháng",
      icon: TrendingUp,
      accent: "text-blue-600 dark:text-blue-500",
      iconBg: "bg-blue-500/10",
      footer: (
        <SevenDayComparisonFooter
          label="LN gộp từ đơn (7 ngày)"
          current={insights.grossProfit.current}
          previous={insights.grossProfit.previous}
        />
      ),
    },
    {
      title: "Tổng tồn kho",
      value: metrics.totalStock.toLocaleString("vi-VN"),
      description: "Tổng cây/chậu còn trong các lô",
      icon: Package,
      accent: "text-amber-600 dark:text-amber-500",
      iconBg: "bg-amber-500/10",
      footer: <p className="text-xs text-muted-foreground">Không có chuỗi thời gian lịch sử trong DB để so sánh.</p>,
    },
    {
      title: "Số loại sản phẩm",
      value: String(metrics.productCount),
      description: "SKU đang có trong hệ thống",
      icon: Leaf,
      accent: "text-purple-600 dark:text-purple-500",
      iconBg: "bg-purple-500/10",
      footer: <p className="text-xs text-muted-foreground">Theo bảng sản phẩm (kể cả tồn kho 0).</p>,
    },
  ];

  const formatAxisMoney = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return String(value);
  };

  return (
    <div className="space-y-8 pb-10 transition-colors duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute right-0 top-0 p-6 text-foreground/[0.04] md:p-8">
          <Activity className="h-40 w-40 -rotate-12 scale-125 md:h-48 md:w-48" />
        </div>
        <div className="relative z-10 space-y-3">
          <Badge variant="secondary" className="font-medium">
            Dashboard vận hành
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Thống kê <span className="text-emerald-600 dark:text-emerald-500">kinh doanh</span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Số liệu luỹ kế từ database; biểu đồ và % so sánh dựa trên đơn hàng theo ngày (không dùng số mẫu).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.accent}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.footer}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Card className="border-border bg-card shadow-sm lg:col-span-8">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-[1.125rem] w-[1.125rem] text-emerald-600 dark:text-emerald-400" />
                  Doanh thu & lợi nhuận gộp theo ngày
                </CardTitle>
                <CardDescription>
                  7 ngày gần nhất — lợi nhuận gộp = doanh thu đơn trong ngày − giá vốn (COGS) cùng ngày.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  Doanh thu
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  LN gộp
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[360px] pt-2 md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e4e4e7"} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={isDark ? "#71717a" : "#a1a1aa"}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isDark ? "#71717a" : "#a1a1aa"}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatAxisMoney}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(value, name) => {
                    const n = typeof value === "number" ? value : Number(value);
                    const label = name === "revenue" ? "Doanh thu" : "LN gộp";
                    return [formatVnd(Number.isFinite(n) ? n : 0), label];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="grossProfit"
                  name="grossProfit"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGross)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border bg-card shadow-sm lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Layers className="h-[1.125rem] w-[1.125rem] text-amber-600 dark:text-amber-400" />
              Cơ cấu chi phí (luỹ kế)
            </CardTitle>
            <CardDescription>Tỷ trọng COGS vs chi phí vận hành đã ghi nhận</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Giá vốn (COGS)</span>
                  <span className="tabular-nums text-foreground">{formatVnd(metrics.totalCOGS)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${(metrics.totalCOGS / Math.max(1, metrics.totalCOGS + metrics.totalExpenses)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Chi phí vận hành</span>
                  <span className="tabular-nums text-foreground">{formatVnd(metrics.totalExpenses)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{
                      width: `${(metrics.totalExpenses / Math.max(1, metrics.totalCOGS + metrics.totalExpenses)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:bg-emerald-500/10">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-2">
                  <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                </div>
                <div className="text-sm font-semibold text-foreground">Nhận định nhanh</div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {metrics.netProfit > 0
                  ? "Luỹ kế đang lãi sau các khoản đã ghi nhận. Tiếp tục theo dõi biên LN gộp theo ngày trên biểu đồ."
                  : "Luỹ kế đang âm hoặc sát 0 — nên rà soát giá nhập, chi phí tháng và tồn kho chậm luân chuyển."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
