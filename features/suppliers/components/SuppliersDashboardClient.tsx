"use client";

import React, { useState, useMemo } from 'react';
import { SupplierTable } from "@/features/suppliers/components/SupplierTable";
import { SupplierForm } from "@/features/suppliers/components/SupplierForm";
import { 
  Users, Truck, Search, TreePine, Building2, LayoutGrid, ListFilter 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Supplier = any; // Will be typed properly in the component

export default function SuppliersDashboardClient({ initialData }: { initialData: Supplier[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "garden" | "provider">("all");

  const filteredData = useMemo(() => {
    return initialData.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (s.phone && s.phone.includes(searchQuery));
      const matchesTab = activeTab === "all" || s.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [initialData, searchQuery, activeTab]);

  return (
    <div className="space-y-6">
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 🛠️ Sidebar Mini 🛠️ */}
      <div className="w-full lg:w-64 shrink-0 space-y-6">
        <div className="bg-zinc-900/30 p-4 rounded-3xl border border-white/5 backdrop-blur-md space-y-4">
          <div className="px-2">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Danh mục</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === "all" 
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20" 
                    : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                }`}
              >
                <LayoutGrid size={16} /> Tất cả đối tác
              </button>
              <button
                onClick={() => setActiveTab("garden")}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === "garden" 
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20" 
                    : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                }`}
              >
                <TreePine size={16} /> Nhà vườn (Cây)
              </button>
              <button
                onClick={() => setActiveTab("provider")}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === "provider" 
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20" 
                    : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                }`}
              >
                <Building2 size={16} /> Nơi cung cấp (Vật tư)
              </button>
            </div>
          </div>

          <div className="h-px bg-white/5 mx-2" />

          <div className="px-2 space-y-2">
            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Tìm kiếm nhanh</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <Input 
                placeholder="Tên, SĐT..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-950 border-white/5 h-10 rounded-xl focus:ring-emerald-500/50 text-white text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <SupplierTable data={filteredData} />
      </div>
      </div>
    </div>
  );
}
