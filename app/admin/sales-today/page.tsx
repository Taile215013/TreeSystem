import React from 'react';
import { 
  Banknote, CreditCard, Truck, 
  ArrowLeftRight, Calendar as CalendarIcon, 
  ChevronRight, ShoppingBag, Receipt 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financeService } from '@/features/finance/services/finance.service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import Link from 'next/link';

export default async function SalesTodayPage() {
  const { summary, orders, dateFormatted } = await financeService.getDailySalesSummary();

  const PAYMENT_LABELS: Record<string, {label: string, icon: any, color: string}> = {
    cash: { label: "Tiền mặt", icon: Banknote, color: "text-emerald-600 dark:text-emerald-500 bg-emerald-500/10" },
    bank_transfer: { label: "Chuyển khoản", icon: CreditCard, color: "text-blue-600 dark:text-blue-500 bg-blue-500/10" },
    cod: { label: "Thu hộ (COD)", icon: Truck, color: "text-orange-600 dark:text-orange-500 bg-orange-500/10" }
  };

  return (
    <div className="space-y-8 pb-10 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <Receipt className="text-emerald-600 dark:text-emerald-500" /> Doanh Số Hôm Nay
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Báo cáo chốt sổ ngày {dateFormatted}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase shadow-sm">
          <CalendarIcon size={14} /> {dateFormatted}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cash Card */}
        <Card className="bg-white dark:bg-zinc-950 border-emerald-500/10 dark:border-emerald-500/20 shadow-sm dark:shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Banknote size={14} className="text-emerald-600 dark:text-emerald-500" /> Tiền Mặt Tại Két
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono">
              {summary.cash.toLocaleString()}đ
            </div>
            <div className="mt-4 h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-emerald-500 transition-all duration-1000" 
                 style={{ width: `${(summary.cash / (summary.total || 1)) * 100}%` }} 
               />
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-2">Chiếm {((summary.cash / (summary.total || 1)) * 100).toFixed(1)}% tổng doanh số</p>
          </CardContent>
        </Card>

        {/* Bank Transfer Card */}
        <Card className="bg-white dark:bg-zinc-950 border-blue-500/10 dark:border-blue-500/20 shadow-sm dark:shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <CreditCard size={14} className="text-blue-600 dark:text-blue-500" /> Chuyển Khoản / App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono">
              {summary.bank_transfer.toLocaleString()}đ
            </div>
            <div className="mt-4 h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-blue-500 transition-all duration-1000" 
                 style={{ width: `${(summary.bank_transfer / (summary.total || 1)) * 100}%` }} 
               />
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-2">Chiếm {((summary.bank_transfer / (summary.total || 1)) * 100).toFixed(1)}% tổng doanh số</p>
          </CardContent>
        </Card>

        {/* COD Card */}
        <Card className="bg-white dark:bg-zinc-950 border-orange-500/10 dark:border-orange-500/20 shadow-sm dark:shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-[40px] rounded-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Truck size={14} className="text-orange-600 dark:text-orange-500" /> Người Giao Thu Hộ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono">
              {summary.cod.toLocaleString()}đ
            </div>
            <div className="mt-4 h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-orange-500 transition-all duration-1000" 
                 style={{ width: `${(summary.cod / (summary.total || 1)) * 100}%` }} 
               />
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-2">Chiếm {((summary.cod / (summary.total || 1)) * 100).toFixed(1)}% tổng doanh số</p>
          </CardContent>
        </Card>
      </div>

      {/* Total Card */}
      <Card className="bg-gradient-to-r from-zinc-800 to-zinc-950 border-zinc-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <CardContent className="py-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-tighter">Tổng Doanh Số Toàn Bộ Hôm Nay</h2>
            <div className="text-5xl font-black text-white tracking-tighter italic">
              {summary.total.toLocaleString()}đ
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center min-w-[120px]">
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Số đơn hàng</p>
              <p className="text-xl font-black text-white">{orders.length}</p>
            </div>
            <div className="p-4 bg-emerald-500/15 rounded-2xl border border-emerald-500/30 text-center min-w-[120px]">
              <p className="text-[10px] text-emerald-300 uppercase font-bold">Trung bình/Đơn</p>
              <p className="text-xl font-black text-emerald-400">
                {(summary.total / (orders.length || 1)).toLocaleString()}đ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Transaction List */}
      <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase flex items-center gap-2">
            <ShoppingBag size={16} className="text-emerald-600 dark:text-emerald-500" /> Danh sách giao dịch đối soát
          </CardTitle>
          <Link href="/admin/finance" className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1">
             Xem báo cáo tháng <ChevronRight size={10} />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/30">
              <TableRow className="border-zinc-200 dark:border-white/10">
                <TableHead className="text-zinc-500 dark:text-zinc-500 text-xs">Mã đơn</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-500 text-xs">Giờ</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-500 text-xs">Hình thức</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-500 text-xs">Trạng thái</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-500 text-xs text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? orders.map((order) => {
                const config = PAYMENT_LABELS[order.paymentMethod || 'cash'] || PAYMENT_LABELS.cash;
                return (
                  <TableRow key={order.id} className="border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="font-mono text-[11px] text-emerald-600 dark:text-emerald-500">
                      #{order.id.toString().padStart(5, '0')}
                    </TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {format(new Date(order.orderDate || new Date()), 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full w-fit text-[10px] font-bold ${config.color}`}>
                        <config.icon size={10} /> {config.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium">
                        {order.status === 'delivered' ? 'Đã hoàn thành' : 'Đang xử lý'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-zinc-900 dark:text-white font-black text-sm">
                      {Number(order.totalPrice).toLocaleString()}đ
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-zinc-400 dark:text-zinc-600 italic text-sm">
                    Hôm nay chưa phát sinh đơn hàng nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
