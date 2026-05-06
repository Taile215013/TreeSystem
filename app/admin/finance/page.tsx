import React from 'react';
import { 
  Banknote, TrendingUp, TrendingDown, 
  Wallet, PieChart as PieChartIcon, 
  Plus, History, Clock, CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { financeService } from '@/features/finance/services/finance.service';
import FinanceDashboardClient from './FinanceDashboardClient';

export default async function AdminFinancePage() {
  // Lấy dữ liệu từ Service (Server side)
  const summary = await financeService.getFinanceSummary();
  const recentExpenses = await financeService.getRecentExpenses(15);
  const breakdown = await financeService.getExpenseBreakdown();

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Quản Lý Tài Chính</h1>
          <p className="text-zinc-500 text-sm">Thống kê doanh thu, chi phí và lợi nhuận ròng tháng {summary.monthName}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <Clock size={16} className="text-emerald-500" />
          <span className="text-xs font-bold text-emerald-400 uppercase">Cập nhật thời gian thực</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-950 border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500" /> Tổng Doanh Thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white font-mono">
              {summary.revenue.toLocaleString()}đ
            </div>
            <p className="text-[10px] text-zinc-600 mt-1">Dựa trên toàn bộ đơn hàng trong tháng</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-red-500/20 transition-all" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingDown size={14} className="text-red-500" /> Chi Phí Vận Hành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white font-mono">
              {summary.totalExpenses.toLocaleString()}đ
            </div>
            <p className="text-[10px] text-red-400/80 mt-1 flex items-center gap-1">
              <Clock size={10} /> Phải chi: {summary.pendingExpenses.toLocaleString()}đ
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-orange-500/20 transition-all" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Banknote size={14} className="text-orange-500" /> Tiền Vốn (COGS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white font-mono">
              {summary.cogs.toLocaleString()}đ
            </div>
            <p className="text-[10px] text-zinc-600 mt-1">Ước tính vốn hàng đã bán ra</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-600 border-none shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[50px] rounded-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-emerald-100 uppercase tracking-widest flex items-center gap-2">
              <Wallet size={14} /> Lợi Nhuận Ròng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white font-mono">
              {summary.netProfit.toLocaleString()}đ
            </div>
            <p className="text-[10px] text-emerald-200/80 mt-1 font-medium">Tiền thực lãi về túi sau chi phí</p>
          </CardContent>
        </Card>
      </div>

      {/* Client Logic Section (Charts, Forms, Tables) */}
      <FinanceDashboardClient 
        breakdown={breakdown} 
        recentExpenses={recentExpenses} 
      />
    </div>
  );
}
