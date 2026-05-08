"use client";

import React from 'react';
import { 
  Phone, MapPin, Calendar, Truck, 
  MoreVertical, Edit2, Trash2, UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { deleteSupplierAction } from "../actions/supplier.actions";

interface Supplier {
  id: number;
  name: string;
  imageUrl?: string | null;
  phone: string | null;
  address: string | null;
  specifications?: string | null;
  type: "garden" | "provider";
  createdAt: Date | null;
  batchCount: number;
}


export function SupplierTable({ data }: { data: Supplier[] }) {
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) return;
    const res = await deleteSupplierAction(id);
    if (!res.success) alert(res.message);
  };

  return (
    <div className="rounded-3xl border border-white/5 overflow-hidden bg-zinc-950 shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead className="bg-zinc-900/80 text-zinc-400 text-xs uppercase tracking-widest font-bold">
          <tr>
            <th className="px-6 py-4">Nhà cung cấp</th>
            <th className="px-6 py-4">Liên hệ</th>
            <th className="px-6 py-4">Số đợt cấp hàng</th>
            <th className="px-6 py-4">Ngày hợp tác</th>
            <th className="px-6 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.length > 0 ? data.map((s) => (
            <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-emerald-500 font-black text-xl">{s.name.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="absolute top-0 right-0 p-0.5">
                      <div className={`h-2 w-2 rounded-full ${s.type === 'garden' ? 'bg-emerald-500' : 'bg-blue-500'} shadow-sm shadow-black`} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="font-bold text-white text-base leading-tight">{s.name}</div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${s.type === 'garden' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {s.type === 'garden' ? 'Nhà vườn' : 'Cung cấp'}
                      </span>
                      {s.specifications && (
                        <span className="text-[9px] text-zinc-500 italic truncate max-w-[150px]">
                          • {s.specifications}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <Phone size={14} className="text-zinc-500" /> {s.phone || "---"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 max-w-[200px] truncate">
                    <MapPin size={12} /> {s.address || "Chưa có địa chỉ"}
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <div className="bg-zinc-900 px-3 py-1 rounded-lg border border-white/5 text-sm">
                    {s.batchCount} <span className="text-zinc-500 text-[10px] font-normal">lô hàng</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} /> 
                  {s.createdAt ? format(new Date(s.createdAt), "dd/MM/yyyy", { locale: vi }) : "---"}
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-2">
                   {/* Tạm thời dùng các nút rời nếu dự án chưa cài DropdownMenu của Shadcn */}
                   <Button 
                    variant="ghost" size="icon" 
                    className="text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl"
                   >
                     <Edit2 size={16} />
                   </Button>
                   <Button 
                    variant="ghost" size="icon" 
                    className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                    onClick={() => handleDelete(s.id)}
                   >
                     <Trash2 size={16} />
                   </Button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
               <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-zinc-500 leading-relaxed italic">
                     <UserPlus size={40} className="mb-2 opacity-20" />
                     Chưa có thông tin nhà cung cấp nào.<br/>Nhấp vào "Thêm nhà cung cấp" để bắt đầu.
                  </div>
               </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
