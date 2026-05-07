"use client";

import { useState } from "react";
import { 
  History, 
  ChevronRight, 
  Calendar, 
  User, 
  DollarSign, 
  Box,
  ChevronDown,
  ChevronUp,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface WarehouseHistoryProps {
  history: any[];
}

export default function WarehouseHistory({ history }: WarehouseHistoryProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!history || history.length === 0) {
    return (
      <div className="bg-pink-50 border border-pink-200 rounded-2xl p-8 text-center">
        <History className="h-12 w-12 text-pink-200 mx-auto mb-3" />
        <p className="text-pink-400">Chưa có lịch sử nhập kho nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <History className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-bold text-zinc-900">Lịch sử Nhập kho Gần đây</h2>
      </div>

      <div className="grid gap-4">
        {history.map((receipt) => (
          <div 
            key={receipt.id}
            className="bg-white border border-pink-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-pink-300 shadow-sm"
          >
            {/* Header of each receipt */}
            <div 
              className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
              onClick={() => toggleExpand(receipt.id)}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 font-mono font-bold text-xs">
                  #{receipt.id}
                </div>
                <div>
                  <div className="font-bold text-zinc-900 flex items-center gap-2">
                    {receipt.receiptCode}
                    <span className="text-[10px] bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      Phiếu nhập
                    </span>
                  </div>
                  <div className="text-xs text-pink-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(receipt.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {receipt.supplier?.name || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-pink-400">Tổng tiền</div>
                  <div className="font-black text-pink-600">
                    {Number(receipt.totalAmount).toLocaleString("vi-VN")}đ
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-400 transition-transform">
                  {expandedId === receipt.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </div>

            {/* Details (Expanded) */}
            {expandedId === receipt.id && (
              <div className="border-t border-pink-100 bg-pink-50/30 p-4 md:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">Chi phí vận hành</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Vận chuyển:</span>
                        <span className="font-mono text-zinc-900">{Number(receipt.shippingCost).toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Nhân công:</span>
                        <span className="font-mono text-zinc-900">{Number(receipt.laborCost).toLocaleString("vi-VN")}đ</span>
                      </div>
                    </div>
                  </div>
                  
                  {receipt.notes && (
                    <div className="space-y-2 lg:col-span-2">
                      <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">Ghi chú</p>
                      <p className="text-sm text-pink-600 italic">"{receipt.notes}"</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">Sản phẩm trong lô</p>
                  <div className="grid gap-2">
                    {receipt.batches?.map((batch: any) => (
                      <div 
                        key={batch.id}
                        className="bg-white border border-pink-50 rounded-xl p-3 flex items-center justify-between group hover:border-pink-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-300 group-hover:text-pink-600 transition-colors">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-zinc-900">
                              {batch.product?.name}
                            </div>
                            <div className="text-[10px] text-pink-400 uppercase">
                              SL: {batch.originalQuantity} {batch.unit} · Giá nhập: {Number(batch.importPrice).toLocaleString("vi-VN")}đ
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-zinc-900">
                            {(batch.originalQuantity * Number(batch.importPrice)).toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
