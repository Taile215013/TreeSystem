"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import { products } from "@/db/schema";
import { 
  Image as ImageIcon, 
  CalendarDays, 
  Edit3, 
  Save, 
  X, 
  Check, 
  Loader2, 
  Droplets, 
  LayoutGrid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  PlusCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag,
  Eye,
  Square,
  CheckSquare,
  MoreVertical,
  Filter
} from "lucide-react";
import Image from "next/image";
import { DeleteProductButton } from "./DeleteProductButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, ShieldCheck } from "lucide-react";

import { bulkUpdateProductsAction, bulkDeleteProductsAction } from "../actions/product.actions";
import { CustomImageUpload } from "./CustomImageUpload";
import { UpdateProductInput } from "../schemas/product.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Simple custom checkbox
const Checkbox = ({ checked, onCheckedChange, className, disabled }: { checked: boolean, onCheckedChange: (val: boolean) => void, className?: string, disabled?: boolean }) => (
  <input 
    type="checkbox" 
    checked={checked} 
    onChange={(e) => onCheckedChange(e.target.checked)}
    disabled={disabled}
    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-zinc-300 text-primary focus:ring-primary/20 cursor-pointer disabled:opacity-30 transition-all ${className}`}
  />
);

export type Product = typeof products.$inferSelect & {
  totalStock?: number;
  category?: { id: number; name: string } | null;
  supplier?: { 
    id: number; 
    name: string; 
    imageUrl?: string | null; 
    specifications?: string | null; 
  } | null;
};

interface ProductTableProps {
  products: Product[];
  isAdmin: boolean;
}

const plantTypeOptions = [
  { value: "Leaf", label: "🍃 Cây lá" },
  { value: "Flower", label: "🌸 Cây hoa" },
  { value: "Fruit", label: "🍎 Cây trái" },
];

const dimensionSuggestions = [
  "C5", "C7", "C9", "C10", "C15", "C20", 
  "20cm", "40cm", "60cm", "80cm", "100cm", "120cm", "150cm", "170cm", "200cm"
];

const processDim = (val: string) => {
  if (!val) return "";
  // Nếu là số thuần túy (ví dụ: "170")
  if (/^\d+$/.test(val.trim())) {
    const num = parseInt(val);
    if (num >= 100) return `${num / 100}m`;
    return `${num}cm`;
  }
  // Nếu có cả chữ và số (ví dụ: "C20", "1.5m") -> Giữ nguyên
  return val;
};

export function ProductTable({ products: initialProducts, isAdmin }: ProductTableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Record<number, Partial<UpdateProductInput>>>({});
  const [isPending, startTransition] = useTransition();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to grid for better mobile view
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState<"trash" | "permanent">("trash");

  const itemsPerPage = 20; // Increased since items are smaller now

  useEffect(() => {
    if (!isEditing) setSelectedIds([]);
  }, [isEditing]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(query) || 
        p.supplier?.name?.toLowerCase().includes(query) ||
        p.category?.name?.toLowerCase().includes(query)
      );
    }
    if (sortConfig !== null) {
      result.sort((a: any, b: any) => {
        let aVal = a[sortConfig.key as keyof Product];
        let bVal = b[sortConfig.key as keyof Product];
        if (sortConfig.key === 'currentPrice') {
          aVal = Number(aVal);
          bVal = Number(bVal);
        }
        if (aVal! < bVal!) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal! > bVal!) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [initialProducts, sortConfig, searchQuery]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const toggleSelect = (id: number) => {
    if (!isEditing) return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (!isEditing) return;
    const currentPageIds = paginatedProducts.map(p => p.id);
    const allSelected = currentPageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleBulkDeleteConfirm = () => {
    startTransition(async () => {
      const res = await bulkDeleteProductsAction(selectedIds, bulkDeleteMode);
      if (res.success) {
        setSelectedIds([]);
        setIsBulkDeleteDialogOpen(false);
      } else {
        alert(res.message);
      }
    });
  };


  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-2.5 w-2.5 ml-1 opacity-20" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-2.5 w-2.5 ml-1 text-primary" /> : <ArrowDown className="h-2.5 w-2.5 ml-1 text-primary" />;
  };

  const handleChange = (id: number, field: string, value: any) => {
    setEditedData((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSaveAll = () => {
    const updates = Object.entries(editedData).map(([id, data]) => ({ id: parseInt(id), data: data as UpdateProductInput }));
    if (updates.length === 0) { setIsEditing(false); return; }
    startTransition(async () => {
      const res = await bulkUpdateProductsAction(updates);
      if (res.success) { setIsEditing(false); setEditedData({}); }
      else alert(res.message);
    });
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* 🛠️ Compact Toolbar 🛠️ */}
      <div className="flex flex-col gap-3 px-1 sm:px-2">
        <div className="flex flex-row items-center justify-between gap-2">
          {/* Search Input (More compact) */}
          <div className="relative group flex-1 max-w-[200px] sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Tìm..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-8 h-9 bg-white/50 dark:bg-zinc-900/50 border-border/40 rounded-xl focus-visible:ring-primary/20 transition-all text-[11px] sm:text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
             {/* View Toggle (Smaller) */}
             <div className="flex items-center bg-zinc-100 dark:bg-white/5 p-0.5 rounded-lg border border-border/40 shrink-0">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              onClick={() => { if (isEditing) setEditedData({}); setIsEditing(!isEditing); }}
              variant={isEditing ? "default" : "outline"}
              className={`h-8 sm:h-9 rounded-lg font-black text-[9px] uppercase tracking-tighter transition-all px-2 sm:px-3 ${
                isEditing ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/20" : "border-border/60"
              }`}
            >
              {isEditing ? <X className="h-3 w-3 sm:mr-1.5" /> : <Edit3 className="h-3 w-3 sm:mr-1.5" />}
              <span className="hidden xs:inline">{isEditing ? "Hủy" : "Sửa"}</span>
            </Button>

            {isEditing && (
              <Button
                onClick={handleSaveAll}
                disabled={isPending}
                className="h-8 sm:h-9 px-3 sm:px-4 bg-primary text-white rounded-lg font-black text-[9px] uppercase tracking-tighter shadow-lg shadow-primary/20"
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 sm:mr-1.5" />}
                <span className="hidden xs:inline">Lưu</span>
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Delete Floating Bar on Mobile */}
        {isEditing && selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl animate-in slide-in-from-top-2">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Đã chọn {selectedIds.length} mục</span>
            <Button
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              disabled={isPending}
              variant="destructive"
              className="h-7 px-3 rounded-lg font-black text-[9px] uppercase tracking-wider"
            >
              Tiếp tục xóa
            </Button>
          </div>
        )}
      </div>

      {/* 🗑️ Bulk Delete Dialog 🗑️ */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl sm:max-w-[420px] overflow-hidden p-0 shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
          <div className="p-6">
            <DialogHeader>
              <div className="mx-auto h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center mb-3 ring-4 ring-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <DialogTitle className="text-center text-lg font-black tracking-tight">
                Xác nhận xóa {selectedIds.length} sản phẩm
              </DialogTitle>
              <DialogDescription className="text-center text-zinc-500 dark:text-zinc-400 text-xs mt-1">
              Bạn có chắc chắn muốn xóa {selectedIds.length} sản phẩm đã chọn? Hãy chọn hình thức xóa phù hợp.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Selection */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBulkDeleteMode("trash")}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${bulkDeleteMode === "trash" ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-zinc-100 dark:border-zinc-800 text-zinc-400"}`}
            >
              <Trash2 className="h-4 w-4 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Thùng rác</span>
              <span className="text-[8px] opacity-60">(Lưu 2 tuần)</span>
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteMode("permanent")}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${bulkDeleteMode === "permanent" ? "border-red-500 bg-red-500/10 text-red-600" : "border-zinc-100 dark:border-zinc-800 text-zinc-400"}`}
            >
              <AlertTriangle className="h-4 w-4 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Xóa vĩnh viễn</span>
              <span className="text-[8px] opacity-60">(Mất hoàn toàn)</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-6 p-6 pt-0">
            <Button
              onClick={handleBulkDeleteConfirm}
              disabled={isPending}
              className={`w-full h-11 rounded-xl font-black text-xs uppercase ${bulkDeleteMode === "permanent" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              {bulkDeleteMode === "permanent" ? "Xác nhận xóa vĩnh viễn" : "Chuyển vào thùng rác"}
            </Button>
            <Button variant="ghost" onClick={() => setIsBulkDeleteDialogOpen(false)} className="text-[10px] font-bold">Hủy bỏ</Button>
          </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* 📦 Content Area (Optimized for Small Screens) 📦 */}
      <div className="transition-all duration-500">
        {viewMode === 'list' ? (
          <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-border/40 shadow-xl overflow-hidden mx-1">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-white/5 border-b border-border/20">
                    <th className="px-3 py-3 w-10 text-center">
                      <Checkbox 
                        checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p.id))}
                        onCheckedChange={toggleSelectAll}
                        disabled={!isEditing}
                      />
                    </th>
                    <th onClick={() => requestSort('name')} className="px-3 py-3 text-[9px] font-black text-zinc-400 uppercase cursor-pointer hover:text-primary transition-colors">
                      Sản phẩm {getSortIcon('name')}
                    </th>
                    <th className="px-3 py-3 text-[9px] font-black text-zinc-400 uppercase hidden sm:table-cell">Thuộc tính</th>
                    <th className="px-3 py-3 text-[9px] font-black text-zinc-400 uppercase hidden md:table-cell">Quy cách / Kích thước</th>
                    <th className="px-3 py-3 text-[9px] font-black text-zinc-400 uppercase hidden sm:table-cell">Loại</th>
                    <th className="px-3 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {/* 📂 Grouping Logic 📂 */}
                  {Array.from(new Set(paginatedProducts.map(p => p.plantType))).map(type => {
                    const groupProducts = paginatedProducts.filter(p => p.plantType === type);
                    const typeOption = plantTypeOptions.find(opt => opt.value === type);
                    const typeLabel = typeOption ? typeOption.label : (type || "Khác");

                    return (
                      <React.Fragment key={type}>
                        {/* Group Header Row */}
                        <tr className="bg-zinc-100/30 dark:bg-white/5 backdrop-blur-sm sticky left-0 z-10 border-y border-border/10">
                          <td colSpan={5} className="px-3 py-1.5">
                             <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/40" />
                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
                                   {typeLabel} <span className="opacity-50 ml-1">({groupProducts.length})</span>
                                </span>
                             </div>
                          </td>
                        </tr>
                        
                        {groupProducts.map((p) => {
                          const isSelected = selectedIds.includes(p.id);
                          const current = editedData[p.id] || {};
                          const price = current.currentPrice ?? p.currentPrice;
                          const img = current.imageUrl || p.imageUrl;

                          return (
                            <tr key={p.id} id={`product-${p.id}`} className={`group/row transition-all duration-300 ${isSelected ? 'bg-primary/10' : 'hover:bg-primary/5'}`}>
                              <td className="px-3 py-3 text-center">
                                <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(p.id)} disabled={!isEditing} />
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-12 w-12 shrink-0 group/img shadow-md">
                                    {typeof img === 'string' && img.length > 0 ? (
                                      <Image
                                        src={img}
                                        alt={p.name || "Product"}
                                        fill
                                        sizes="48px"
                                        className="object-cover rounded-xl border border-border/50 group-hover/row:scale-105 transition-transform"
                                      />
                                    ) : (
                                      <div className="h-full w-full bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-dashed border-border/50">
                                        <ImageIcon className="h-5 w-5 text-zinc-300" />
                                      </div>
                                    )}
                                    {isEditing && (
                                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <CustomImageUpload
                                          onUploadComplete={(url) => handleChange(p.id, "imageUrl", url)}
                                          onError={(err) => alert(err)}
                                          className="h-full w-full"
                                        >
                                          <PlusCircle className="h-5 w-5 text-white" />
                                        </CustomImageUpload>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-0.5 min-w-[140px]">
                                    {isEditing ? (
                                      <input
                                        value={current.name ?? p.name}
                                        onChange={(e) => handleChange(p.id, "name", e.target.value)}
                                        className="w-full bg-white dark:bg-zinc-950 px-2 py-1 text-[11px] font-bold border border-primary/20 rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                                      />
                                    ) : (
                                      <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate">{p.name}</div>
                                    )}
                                    {/* 🌿 Nested Data Group 🌿 */}
                                    <div className="flex flex-wrap items-center gap-1.5 opacity-60">
                                      <div className="flex items-center gap-0.5 text-[8px] font-bold text-blue-500 uppercase">
                                        <Droplets className="h-2 w-2" />
                                        {current.waterNeed ?? p.waterNeed}
                                      </div>
                                      <span className="text-zinc-300 text-[8px]">•</span>
                                      <div className="text-[8px] font-bold text-zinc-500 uppercase">
                                        {current.potSize ?? p.potSize ?? "N/A"}
                                      </div>
                                      {p.category && (
                                        <>
                                          <span className="text-zinc-300 text-[8px]">•</span>
                                          <div className="text-[8px] font-bold text-emerald-600 bg-emerald-500/10 px-1 rounded uppercase">
                                            {p.category.name}
                                          </div>
                                        </>
                                      )}
                                      {p.supplier && (
                                        <>
                                          <span className="text-zinc-300 text-[8px]">•</span>
                                          <div className="flex items-center gap-1 text-[8px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">
                                            {p.supplier.imageUrl && (
                                              <div className="relative h-3 w-3 rounded-full overflow-hidden border border-amber-500/20">
                                                <Image src={p.supplier.imageUrl} alt="" fill className="object-cover" />
                                              </div>
                                            )}
                                            {p.supplier.name}
                                          </div>
                                        </>
                                      )}
                                      {p.supplier?.specifications && (
                                        <>
                                          <span className="text-zinc-300 text-[8px]">•</span>
                                          <div className="text-[8px] font-bold text-zinc-400 italic">
                                            {p.supplier.specifications}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3 hidden sm:table-cell">
                                 {isEditing ? (
                                    <div className="flex flex-col gap-1.5 w-[100px]">
                                      <select
                                        value={(current.waterNeed ?? p.waterNeed) || ""}
                                        onChange={(e) => handleChange(p.id, "waterNeed", e.target.value)}
                                        className="w-full bg-white dark:bg-zinc-950 px-1 py-1 text-[9px] font-bold border border-primary/20 rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                                      >
                                        <option value="Low">💧 Ít nước</option>
                                        <option value="Medium">💧💧 Trung bình</option>
                                        <option value="High">💧💧💧 Nhiều nước</option>
                                        <option value="Aquatic">🌊 Thủy sinh</option>
                                      </select>
                                      <select
                                        value={(current.environment ?? p.environment) || ""}
                                        onChange={(e) => handleChange(p.id, "environment", e.target.value)}
                                        className="w-full bg-white dark:bg-zinc-950 px-1 py-1 text-[9px] font-bold border border-primary/20 rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                                      >
                                        <option value="Indoor">🏠 Trong nhà</option>
                                        <option value="Outdoor">☀️ Ngoài trời</option>
                                        <option value="Hybrid">🌗 Cả hai</option>
                                      </select>
                                    </div>
                                 ) : (
                                    <div className="flex flex-col gap-1 text-[9px] font-bold opacity-70">
                                      <div className="flex items-center gap-1"><Droplets className="h-2.5 w-2.5 text-blue-500"/> {p.waterNeed}</div>
                                      <div className="flex items-center gap-1"><Tag className="h-2.5 w-2.5 text-emerald-500"/> {p.environment}</div>
                                    </div>
                                 )}
                              </td>
                              <td className="px-3 py-3 hidden md:table-cell">
                                 {isEditing ? (
                                    <div className="flex flex-col gap-1 w-[80px]">
                                      <input
                                        list="dimension-suggestions"
                                        placeholder="Chậu"
                                        value={current.potSize ?? p.potSize ?? ""}
                                        onChange={(e) => handleChange(p.id, "potSize", e.target.value)}
                                        onBlur={(e) => handleChange(p.id, "potSize", processDim(e.target.value))}
                                        className="w-full bg-white dark:bg-zinc-950 px-1.5 py-0.5 text-[9px] font-bold border border-primary/20 rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                                      />
                                      <input
                                        list="dimension-suggestions"
                                        placeholder="Cao"
                                        value={current.height ?? p.height ?? ""}
                                        onChange={(e) => handleChange(p.id, "height", e.target.value)}
                                        onBlur={(e) => handleChange(p.id, "height", processDim(e.target.value))}
                                        className="w-full bg-white dark:bg-zinc-950 px-1.5 py-0.5 text-[9px] font-bold border border-primary/20 rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                                      />
                                      <input
                                        list="dimension-suggestions"
                                        placeholder="Rộng"
                                        value={current.diameter ?? p.diameter ?? ""}
                                        onChange={(e) => handleChange(p.id, "diameter", e.target.value)}
                                        onBlur={(e) => handleChange(p.id, "diameter", processDim(e.target.value))}
                                        className="w-full bg-white dark:bg-zinc-950 px-1.5 py-0.5 text-[9px] font-bold border border-primary/20 rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                                      />
                                    </div>
                                 ) : (
                                    <div className="flex flex-col gap-0.5 text-[9px] font-bold opacity-70">
                                      <span>Chậu: {p.potSize || "-"}</span>
                                      <span>Cao: {p.height || "-"}</span>
                                      <span>Rộng: {p.diameter || "-"}</span>
                                    </div>
                                 )}
                              </td>
                              <td className="px-3 py-3 hidden sm:table-cell">
                                {isEditing ? (
                                    <select
                                      value={(current.plantType ?? p.plantType) || ""}
                                      onChange={(e) => handleChange(p.id, "plantType", e.target.value)}
                                      className="w-20 bg-white dark:bg-zinc-950 px-1 py-1 text-[9px] font-bold border border-primary/20 rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                      {plantTypeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                      ))}
                                    </select>
                                ) : (
                                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-border/40">
                                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">{typeLabel}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-3 text-right">
                                {isEditing && <DeleteProductButton id={p.id} isAdmin={isAdmin} />}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Compact Grid View (3 columns on iPhone 12 Pro Max) */
          <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-3 md:gap-4 px-1">
            {paginatedProducts.map((p) => {
              const current = editedData[p.id] || {};
              const img = current.imageUrl || p.imageUrl;
              const isSelected = selectedIds.includes(p.id);
              
              return (
                <div 
                  key={p.id} 
                  id={`product-${p.id}`}
                  className={`group relative bg-white dark:bg-zinc-900 border ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border/40'} rounded-2xl sm:rounded-[2rem] overflow-hidden hover:shadow-lg transition-all duration-500 flex flex-col ${isEditing ? 'cursor-pointer active:scale-95' : 'cursor-default'}`} 
                  onClick={() => isEditing && toggleSelect(p.id)}
                >
                  <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-zinc-50 dark:bg-white/5">
                    {typeof img === 'string' && img.length > 0 && (
                      <Image
                        src={img}
                        alt={p.name || ""}
                        fill
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                    


                    {/* Compact Selection Visual */}
                    {isEditing && isSelected && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                         <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                            <Check className="h-3 w-3 stroke-[4]" />
                         </div>
                      </div>
                    )}

                    {/* Quick Upload / Delete Overlay */}
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                         <CustomImageUpload
                            onUploadComplete={(url) => handleChange(p.id, "imageUrl", url)}
                            onError={(err) => alert(err)}
                            className="bg-primary/80 backdrop-blur-md rounded-xl h-12 w-12 border-none text-white hover:bg-primary transition-colors"
                         >
                            <div className="flex flex-col items-center gap-1">
                               <ImageIcon className="h-5 w-5 text-white" />
                               <span className="text-[8px] font-bold text-white uppercase">Ảnh</span>
                            </div>
                         </CustomImageUpload>
                         <DeleteProductButton id={p.id} isAdmin={isAdmin} />
                      </div>
                    )}
                  </div>

                  <div className="p-1.5 sm:p-3 flex flex-col gap-0.5 sm:gap-1">
                    <h4 className="text-[9px] sm:text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                      {p.name}
                    </h4>
                    <div className="hidden xs:flex items-center justify-between">
                      <span className="text-[7px] sm:text-[8px] font-bold uppercase text-zinc-400">{p.plantType}</span>
                      <div className="flex items-center gap-0.5">
                        <Droplets className="h-2 w-2 text-blue-500" />
                        <span className="text-[7px] sm:text-[8px] font-bold text-blue-500">{p.waterNeed?.substring(0, 3)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 📭 Empty State 📭 */}
        {filteredAndSortedProducts.length === 0 && (
           <div className="py-10 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <Search className="h-6 w-6 opacity-10" />
              <p className="text-[9px] font-black uppercase tracking-widest">Không có kết quả</p>
           </div>
        )}

        {/* 🔢 Compact Pagination 🔢 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="h-7 w-7 rounded-lg border-border/40 shadow-sm"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            
            <div className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-white/5 rounded-lg border border-border/20">
               <span className="text-[9px] font-black text-zinc-500">{currentPage}</span>
               <span className="text-[8px] text-zinc-300">/</span>
               <span className="text-[9px] font-black text-zinc-500">{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="h-7 w-7 rounded-lg border-border/40 shadow-sm"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Global Datalist for Dimension Suggestions */}
      <datalist id="dimension-suggestions">
        {dimensionSuggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
