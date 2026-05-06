"use client";

import { useState, useCallback } from "react";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, CreateProductInput } from "../schemas/product.schema";
import { Loader2, PlusCircle, CheckCircle2, AlertCircle, Layers, ListPlus, Upload, FileSpreadsheet } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bulkCreateProductsAction, createProductAction } from "../actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef } from "react";
import * as XLSX from "xlsx";

// ──────────────────────────────────────────────
// Utility
// ──────────────────────────────────────────────
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function processDimensionValue(val: string): string {
  if (!val) return "";
  // Nếu là số thuần túy (ví dụ: "170")
  if (/^\d+$/.test(val.trim())) {
    const num = parseInt(val);
    if (num >= 100) return `${num / 100}m`;
    return `${num}cm`;
  }
  // Nếu có cả chữ và số (ví dụ: "C20", "1.5m") -> Giữ nguyên
  return val;
}

const dimensionSuggestions = [
  "C5", "C7", "C9", "C10", "C15", "C20", 
  "20cm", "40cm", "60cm", "80cm", "100cm", "120cm", "150cm", "170cm", "200cm"
];

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────
interface AutocompleteFieldProps {
  label: string;
  id: string;
  placeholder?: string;
  suggestions: string[];
  registration: UseFormRegisterReturn;
  onBlur: (e: any) => void;
}

function AutocompleteField({ label, id, placeholder, suggestions, registration, onBlur }: AutocompleteFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          list={`list-${id}`}
          {...registration}
          onBlur={onBlur}
          placeholder={placeholder}
          className="bg-zinc-50/50 dark:bg-white/5 border-border/50 text-zinc-900 dark:text-white text-[11px] h-9 rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-primary/20"
        />
        <datalist id={`list-${id}`}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  id: string;
  options: { value: string; label: string }[];
  registration: UseFormRegisterReturn;
}

function SelectField({ label, id, options, registration }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">
        {label}
      </Label>
      <select
        id={id}
        {...registration}
        className="w-full bg-zinc-50 dark:bg-white/5 border border-border/50 text-zinc-900 dark:text-white rounded-xl p-2 text-xs outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer appearance-none shadow-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export function ProductForm() {
  const [isPending, setIsPending] = useState(false);
  const [bulkNames, setBulkNames] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // ... (useForm setup stays same)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPending(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const content = evt.target?.result;
        if (!content) return;

        if (file.name.endsWith(".json")) {
          setBulkNames(content.toString());
        } else if (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const workbook = XLSX.read(content, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Chuyển sang định dạng Tab-separated để parser thông minh của chúng ta xử lý được
          const tsv = XLSX.utils.sheet_to_csv(worksheet, { FS: "\t" });
          setBulkNames(tsv);
        }
        setMessage({ text: `Đã đọc file "${file.name}" thành công!`, type: "success" });
      } catch (err) {
        setMessage({ text: "Lỗi khi đọc file, vui lòng kiểm tra lại định dạng!", type: "error" });
      } finally {
        setIsPending(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    if (file.name.endsWith(".json") || file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateProductInput>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      status: "active",
      waterNeed: "Medium",
      environment: "Indoor",
      plantType: "Leaf",
      categoryId: undefined,
    },
  });

  const imageUrl = watch("imageUrl");

  const onSubmit = useCallback(
    async (data: CreateProductInput) => {
      setIsPending(true);
      setMessage(null);

      const finalData: CreateProductInput = {
        ...data,
        slug: data.slug || generateSlug(data.name),
      };

      try {
        const res = await createProductAction(finalData);
        if (res.success) {
          setMessage({ text: res.message, type: "success" });
          reset();
        } else {
          setMessage({ text: res.message, type: "error" });
        }
      } catch {
        setMessage({ text: "Lỗi hệ thống, vui lòng thử lại!", type: "error" });
      } finally {
        setIsPending(false);
      }
    },
    [reset]
  );

  const parseSmartData = (input: string): Partial<CreateProductInput>[] => {
    const trimmed = input.trim();
    if (!trimmed) return [];

    // 1. Thử Parse JSON
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.warn("Dữ liệu trông giống JSON nhưng parse lỗi, chuyển sang parse text...");
      }
    }

    // 2. Phân tách dòng
    const lines = trimmed.split("\n").filter((l) => l.trim() !== "");
    
    // Kiểm tra xem có phải định dạng bảng (Excel/CSV) không bằng cách đếm dấu Tab hoặc Phẩy
    const firstLine = lines[0];
    const hasTab = firstLine.includes("\t");
    const hasComma = firstLine.includes(",");

    if (hasTab || hasComma) {
      const separator = hasTab ? "\t" : ",";
      return lines.map((line) => {
        const parts = line.split(separator).map((p) => p.trim());
        // Giả định thứ tự cột thông minh: Tên, Giá, Cỡ chậu, Chiều cao...
        return {
          name: parts[0],
          currentPrice: parts[1] || "0",
          potSize: parts[2] || undefined,
          height: parts[3] || undefined,
          diameter: parts[4] || undefined,
        };
      });
    }

    // 3. Fallback: Danh sách tên đơn thuần
    return lines.map((line) => ({ name: line.trim() }));
  };

  const handleBulkSubmit = async () => {
    const productsToCreate = parseSmartData(bulkNames);
    
    if (productsToCreate.length === 0) {
      setMessage({ text: "Vui lòng nhập dữ liệu hợp lệ!", type: "error" });
      return;
    }

    setIsPending(true);
    setMessage(null);
    try {
      const res = await bulkCreateProductsAction(productsToCreate);
      if (res.success) {
        setMessage({ text: res.message, type: "success" });
        setBulkNames("");
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi hệ thống khi nhập hàng loạt!", type: "error" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-[1.5rem] p-4 sm:p-6 shadow-2xl dark:shadow-none relative overflow-hidden transition-all duration-300 hover:shadow-primary/5">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-primary/15 blur-[100px] rounded-full" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />

      <Tabs defaultValue="single" className="w-full relative z-10">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900/5 dark:bg-white/5 rounded-xl p-1 h-11 mb-6">
          <TabsTrigger value="single" className="rounded-lg text-[11px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
            <PlusCircle className="h-4 w-4 mr-2" /> Thêm từng cái
          </TabsTrigger>
          <TabsTrigger value="bulk" className="rounded-lg text-[11px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
            <ListPlus className="h-4 w-4 mr-2" /> Nhập hàng loạt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4 sm:space-y-6 outline-none">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 pb-1">
              <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center shadow-inner">
                <PlusCircle className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">Thêm Cây Mới</h3>
            </div>

            {/* ── Tên & Mô tả ── */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">
                  Tên Cây *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="VD: Trầu Bà Nam Mỹ"
                  className="bg-zinc-50/50 dark:bg-white/5 border-border/50 text-zinc-900 dark:text-white rounded-xl h-10 focus-visible:ring-primary/40 transition-all shadow-sm text-xs"
                />
                {errors.name && <p className="text-[9px] text-red-500 dark:text-red-400 pl-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">
                  Mô tả ngắn
                </Label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={2}
                  placeholder="Mô tả đặc điểm nổi bật của cây..."
                  className="w-full bg-zinc-50/50 dark:bg-white/5 border border-border/50 text-zinc-900 dark:text-white rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm resize-none"
                />
              </div>
            </div>

            {/* ── Thuộc tính cây ── */}
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Nhu cầu nước"
                id="waterNeed"
                registration={register("waterNeed")}
                options={[
                  { value: "Low", label: "💧 Ít nước" },
                  { value: "Medium", label: "💧💧 Trung bình" },
                  { value: "High", label: "💧💧💧 Nhiều nước" },
                  { value: "Aquatic", label: "🌊 Thủy sinh" },
                ]}
              />
              <SelectField
                label="Điều kiện sống"
                id="environment"
                registration={register("environment")}
                options={[
                  { value: "Indoor", label: "🏠 Trong nhà" },
                  { value: "Outdoor", label: "☀️ Ngoài trời" },
                  { value: "Hybrid", label: "🌗 Cả hai" },
                ]}
              />
              <SelectField
                label="Loại cây"
                id="plantType"
                registration={register("plantType")}
                options={[
                  { value: "Leaf", label: "🍃 Cây lá" },
                  { value: "Flower", label: "🌸 Cây hoa" },
                  { value: "Fruit", label: "🍎 Cây trái" },
                ]}
              />
              <SelectField
                label="Danh mục"
                id="categoryId"
                registration={register("categoryId")}
                options={[
                  { value: "", label: "— Chưa có danh mục —" },
                ]}
              />
            </div>

            {/* ── Kích thước ── */}
            <div className="pt-4 pb-2 border-t border-border/50 space-y-4">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest pl-1">
                Kích thước & Quy cách
              </span>
              <div className="grid grid-cols-3 gap-3">
                <AutocompleteField
                  label="Cỡ chậu"
                  id="potSize"
                  placeholder="VD: C20"
                  suggestions={dimensionSuggestions}
                  registration={register("potSize")}
                  onBlur={(e) => setValue("potSize", processDimensionValue(e.target.value))}
                />
                <AutocompleteField
                  label="Chiều cao"
                  id="height"
                  placeholder="VD: 1.7m"
                  suggestions={dimensionSuggestions}
                  registration={register("height")}
                  onBlur={(e) => setValue("height", processDimensionValue(e.target.value))}
                />
                <AutocompleteField
                  label="Đường kính"
                  id="diameter"
                  placeholder="VD: 50cm"
                  suggestions={dimensionSuggestions}
                  registration={register("diameter")}
                  onBlur={(e) => setValue("diameter", processDimensionValue(e.target.value))}
                />
              </div>
            </div>

            {/* ── Hình ảnh ── */}
            <div className="space-y-3">
              <Label className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">
                Hình Ảnh
              </Label>
              <div className="p-4 rounded-2xl border border-dashed border-border/50 bg-zinc-50/30 dark:bg-white/5 flex flex-col items-center gap-3 transition-colors hover:border-primary/50 group">
                <UploadButton
                  endpoint="productImage"
                  onClientUploadComplete={(res) => {
                    const url = res[0]?.ufsUrl || res[0]?.url;
                    if (url) setValue("imageUrl", url);
                  }}
                  onUploadError={(err) =>
                    setMessage({ text: `Upload lỗi: ${err.message}`, type: "error" })
                  }
                />
                {imageUrl && (
                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-lg group">
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-primary to-emerald-500 text-white rounded-xl h-11 font-bold shadow-lg shadow-primary/25 text-[11px] uppercase tracking-wider"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Thêm Vào Hệ Thống
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6 outline-none">
          {/* Header */}
          <div className="flex items-center gap-3 pb-2">
            <div className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center shadow-inner">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Nhập Hàng Loạt</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                💡 Hỗ trợ dán trực tiếp từ Excel hoặc tải lên file <b>.xlsx, .json, .csv</b>. 
                Thứ tự cột Excel: Tên | Giá | Cỡ chậu | Chiều cao | Đường kính.
              </p>
            </div>

            {/* File Upload Button */}
            <div className="relative group/upload">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.json,.csv"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 border-dashed border-2 border-primary/30 rounded-2xl bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all flex flex-col gap-1 items-center justify-center group"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Chọn File (Excel / JSON / CSV)</span>
                <span className="text-[9px] text-zinc-400">Dữ liệu sẽ được tự động phân tích sau khi tải</span>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <Label className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  Xem trước dữ liệu
                </Label>
                {bulkNames && (
                   <button 
                    onClick={() => setBulkNames("")}
                    className="text-[9px] font-bold text-red-500 uppercase hover:underline"
                   >
                     Xóa trắng
                   </button>
                )}
              </div>
              <textarea
                rows={8}
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                placeholder={"Kết quả đọc file hoặc dán dữ liệu sẽ hiển thị ở đây..."}
                className="w-full bg-zinc-50/50 dark:bg-white/5 border border-border/50 text-zinc-900 dark:text-white rounded-2xl p-4 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-all shadow-sm font-mono"
              />
            </div>

            <Button
              onClick={handleBulkSubmit}
              disabled={isPending || !bulkNames.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl h-14 font-bold shadow-lg shadow-emerald-500/20"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Upload className="mr-2 h-5 w-5" />
              )}
              Xác Nhận Nhập {bulkNames.split("\n").filter(n => n.trim()).length} Sản Phẩm
            </Button>
          </div>
        </TabsContent>

        {/* ── Thông báo ── */}
        {message && (
          <div
            className={`mt-6 flex items-start gap-2 text-sm p-3 rounded-xl border relative z-10 transition-all ${
              message.type === "success"
                ? "text-emerald-700 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/8"
                : "text-red-700 dark:text-red-400 border-red-500/20 bg-red-500/5 dark:bg-red-500/8"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            {message.text}
          </div>
        )}
      </Tabs>
    </div>
  );
}