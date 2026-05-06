"use client";

import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { 
  Plus, History, Trash2, CheckCircle2, 
  Loader2, AlertCircle, Banknote, Calendar, Tag, PieChart as PieChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addExpenseAction, deleteExpenseAction, markAsPaidAction } from '@/features/finance/actions/finance.actions';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface FinanceDashboardClientProps {
  breakdown: any[];
  recentExpenses: any[];
}

const CATEGORY_MAP: Record<string, string> = {
  electric: "Tiền điện",
  water: "Tiền nước",
  internet: "Internet",
  food: "Ăn uống",
  fuel: "Xăng xe",
  salary_fixed: "Lương cố định",
  salary_parttime: "Lương buổi",
  rent: "Mặt bằng",
  marketing: "Quảng cáo",
  maintenance: "Sửa chữa",
  other: "Khác"
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f472b6', '#a855f7', '#6366f1'];

export default function FinanceDashboardClient({ breakdown, recentExpenses }: FinanceDashboardClientProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error' | null}>({text: '', type: null});

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('fuel');
  const [type, setType] = useState('variable');
  const [status, setStatus] = useState('paid');
  const [notes, setNotes] = useState('');

  const chartData = breakdown.map(item => ({
    name: CATEGORY_MAP[item.category] || item.category,
    value: parseFloat(item.total)
  }));

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsPending(true);
    const res = await addExpenseAction({
      amount: parseFloat(amount),
      category: category as any,
      type: type as any,
      status: status as any,
      notes,
      expenseDate: new Date()
    });
    
    if (res.success) {
      setAmount('');
      setNotes('');
      setMessage({text: res.message, type: 'success'});
    } else {
      setMessage({text: res.message, type: 'error'});
    }
    setIsPending(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa khoản chi này?")) return;
    await deleteExpenseAction(id);
  };

  const handleMarkAsPaid = async (id: number) => {
    await markAsPaidAction(id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Charts & Quick Add */}
      <div className="lg:col-span-4 space-y-6">
        {/* Quick Add Form */}
        <Card className="bg-zinc-950 border-white/5 shadow-2xl relative overflow-hidden">
          <div className="h-1.5 bg-emerald-600 w-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-500"><Plus size={18} /> Ghi nhanh chi phí</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Số tiền (VNĐ)</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <Input 
                    type="number"
                    placeholder="20,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-zinc-900 border-white/5 pl-10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Loại chi phí</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-zinc-900 border-white/5 text-white text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 text-white border-white/10">
                      {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                        <SelectItem key={key} value={key} className="text-xs">{val}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Thanh toán</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-zinc-900 border-white/5 text-white text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 text-white border-white/10">
                      <SelectItem value="paid" className="text-xs text-emerald-400">Đã chi</SelectItem>
                      <SelectItem value="pending" className="text-xs text-orange-400">Chưa chi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Ghi chú</Label>
                <Input 
                  placeholder="Xăng xe đi giao cây..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-zinc-900 border-white/5 text-white text-xs"
                />
              </div>

              {message.text && (
                <p className={`text-[10px] p-2 rounded border ${message.type === 'success' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-red-500/5 text-red-400 border-red-500/10'}`}>
                  {message.text}
                </p>
              )}

              <Button 
                disabled={isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 font-bold"
              >
                {isPending ? <Loader2 className="animate-spin" size={18} /> : "Ghi nhận khoản chi"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Breakdown Chart */}
        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-300"><PieChartIcon size={18} /> Phân bổ chi tiêu</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()}đ`, 'Số tiền']}
                  />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-sm">
                Chưa có dữ liệu chi tiêu trong tháng
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: History Table */}
      <div className="lg:col-span-8">
        <Card className="bg-zinc-950 border-white/5 shadow-2xl h-full">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
            <CardTitle className="flex items-center gap-2 text-zinc-200 uppercase tracking-tighter text-sm">
              <History size={18} className="text-emerald-500" /> Nhật ký chi tiêu gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-900/60">
                <TableRow className="border-white/5">
                  <TableHead className="text-zinc-500 text-xs">Ngày</TableHead>
                  <TableHead className="text-zinc-500 text-xs">Hạng mục</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-right">Số tiền</TableHead>
                  <TableHead className="text-zinc-500 text-xs">Ghi chú</TableHead>
                  <TableHead className="text-zinc-500 text-xs">Trạng thái</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExpenses.length > 0 ? recentExpenses.map((ex) => (
                  <TableRow key={ex.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="text-zinc-300 font-mono text-[11px]">
                      {format(new Date(ex.expenseDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-white">{CATEGORY_MAP[ex.category] || ex.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-zinc-100 font-bold text-xs">
                      {parseFloat(ex.amount).toLocaleString()}đ
                    </TableCell>
                    <TableCell className="text-zinc-500 text-[11px] max-w-[150px] truncate">
                      {ex.notes || "-"}
                    </TableCell>
                    <TableCell>
                      {ex.status === 'paid' ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                          <CheckCircle2 size={10} /> Đã chi
                        </div>
                      ) : (
                        <div 
                          onClick={() => handleMarkAsPaid(ex.id)}
                          className="flex items-center gap-1 text-orange-400 text-[10px] bg-orange-500/10 px-2 py-0.5 rounded-full w-fit cursor-pointer hover:bg-orange-500/20 transition-all"
                        >
                          <AlertCircle size={10} /> Cần chi
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(ex.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                     <TableCell colSpan={6} className="text-center py-10 text-zinc-600 italic">
                       Chưa ghi nhận khoản chi nào.
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
