"use client";

import React, { useState } from 'react';
import { 
  ChevronDown, ChevronRight, Package, Calendar, 
  MapPin, DollarSign, Tag, Info, ArrowUpRight,
  Search, Filter, Leaf
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Batch {
  id: number;
  receiptCode: string;
  importPrice: number;
  originalQuantity: number;
  remainingQuantity: number;
  locationName: string;
  importDate: Date | null;
}

interface InventoryItem {
  id: number;
  name: string;
  imageUrl: string | null;
  totalQuantity: number;
  priceRange: {
    min: number;
    max: number;
    isVariable: boolean;
  };
  category: { name: string } | null;
  batches: Batch[];
}

export default function InventoryTable({ data }: { data: InventoryItem[] }) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredData = data.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 transition-colors duration-300">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Package className="text-emerald-600 dark:text-emerald-500" /> Tồn kho theo lô
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Quản lý giá trị tồn kho theo từng đợt nhập (toa hàng)</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
          <Input 
            placeholder="Tìm tên cây..." 
            className="pl-10 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-white/10 rounded-2xl focus:ring-emerald-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-3xl border border-zinc-200 dark:border-white/5 overflow-hidden bg-white dark:bg-zinc-950 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-widest font-bold border-b border-zinc-200 dark:border-white/5">
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Tổng tồn</th>
                <th className="px-6 py-4">Khoảng giá nhập</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {filteredData.map((product) => (
                <React.Fragment key={product.id}>
                  {/* Main Product Row */}
                  <tr 
                    onClick={() => toggleRow(product.id)}
                    className={cn(
                      "group cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.02]",
                      expandedRows[product.id] ? "bg-zinc-50/50 dark:bg-white/[0.03]" : ""
                    )}
                  >
                    <td className="px-6 py-5">
                      {expandedRows[product.id] ? 
                        <ChevronDown size={20} className="text-emerald-600 dark:text-emerald-500" /> : 
                        <ChevronRight size={20} className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400" />
                      }
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 relative overflow-hidden flex-shrink-0 shadow-inner">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-700">
                              <Leaf size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white text-lg transition-colors">{product.name}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-500">ID: #{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-zinc-900 dark:text-white">{product.totalQuantity}</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-tighter">Cây trong kho</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {product.priceRange.min.toLocaleString()}đ 
                        {product.priceRange.isVariable && ` ~ ${product.priceRange.max.toLocaleString()}đ`}
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Giá vốn theo lô</div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant="outline" className="bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-transparent">
                        {product.category?.name || "Chưa phân loại"}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Badge className={cn(
                        "font-bold px-3 py-1 rounded-full text-[10px] shadow-sm",
                        product.totalQuantity > 10 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                        product.totalQuantity > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                        "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                      )}>
                        {product.totalQuantity > 10 ? "Sẵn hàng" : product.totalQuantity > 0 ? "Sắp hết" : "Hết hàng"}
                      </Badge>
                    </td>
                  </tr>

                  {/* Expanded Batches Display */}
                  {expandedRows[product.id] && (
                    <tr>
                      <td colSpan={6} className="bg-zinc-50/30 dark:bg-zinc-950 px-6 py-0">
                        <div className="py-6 space-y-4 border-t border-b border-zinc-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-4">
                            <Info size={14} className="text-emerald-500" /> Chi tiết từng toa hàng nhập về (Specific Batches)
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                            {product.batches.map((batch) => (
                              <div key={batch.id} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-4 rounded-3xl hover:border-emerald-500/30 transition-all group shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                     <div className="text-emerald-600 dark:text-emerald-500 font-black text-sm mb-0.5">{batch.receiptCode}</div>
                                     <div className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-medium">
                                        <Calendar size={10} /> {batch.importDate ? new Date(batch.importDate).toLocaleDateString() : ""}
                                     </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-zinc-900 dark:text-white font-bold text-base">{batch.importPrice.toLocaleString()}đ</div>
                                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Giá nhập toa này</div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4 p-3 bg-zinc-50 dark:bg-black/40 rounded-2xl border border-zinc-100 dark:border-white/5">
                                  <div className="text-center">
                                    <div className="text-zinc-400 text-[9px] uppercase font-bold">Ban đầu</div>
                                    <div className="text-zinc-600 dark:text-zinc-300 font-mono text-xs">{batch.originalQuantity}</div>
                                  </div>
                                  <div className="h-6 w-px bg-zinc-200 dark:bg-white/5" />
                                  <div className="text-center">
                                    <div className="text-emerald-600 dark:text-emerald-500 text-[9px] uppercase font-bold">Hiện còn</div>
                                    <div className="text-zinc-900 dark:text-white font-mono text-sm font-black">{batch.remainingQuantity}</div>
                                  </div>
                                  <div className="h-6 w-px bg-zinc-200 dark:bg-white/5" />
                                  <div className="text-right">
                                     <div className="text-zinc-400 text-[9px] uppercase font-bold flex items-center gap-1 justify-end font-medium">
                                        <MapPin size={8} /> Vị trí
                                     </div>
                                     <div className="text-zinc-700 dark:text-zinc-300 text-xs font-bold">{batch.locationName}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
