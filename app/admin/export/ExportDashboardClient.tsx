"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileDown, FileSpreadsheet, ImageDown, Loader2,
  Calendar as CalendarIcon, Tag, Package, BarChart2,
  ChevronRight
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { getReceiptsByDateRangeAction } from "@/features/export/actions/export.actions";
import type { ReceiptExportRow, PriceListRow } from "@/features/export/types/export.types";
import Image from "next/image";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type ActiveTab = "warehouse" | "pricelist";

interface ExportDashboardProps {
  receiptDates: string[];   // "YYYY-MM-DD" strings
  priceList: PriceListRow[];
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function formatVND(val: string | number): string {
  return Number(val).toLocaleString("vi-VN") + "đ";
}

function formatDate(d: Date | null | undefined): string {
  if (!d || !isValid(d)) return "—";
  return format(d, "dd/MM/yyyy", { locale: vi });
}

// ──────────────────────────────────────────────
// Tab Button
// ──────────────────────────────────────────────
function TabButton({
  active, onClick, icon: Icon, label, count
}: {
  active: boolean; onClick: () => void;
  icon: React.ElementType; label: string; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active
          ? "bg-sky-500/10 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/40 text-sky-600 dark:text-sky-300 shadow-lg shadow-sky-500/5 dark:shadow-sky-500/10"
          : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {count !== undefined && (
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
          active ? "bg-sky-500/20 dark:bg-sky-500/25 text-sky-600 dark:text-sky-300" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ──────────────────────────────────────────────
// Export Buttons
// ──────────────────────────────────────────────
function ExportButtons({
  onExcelExport, onImageExport, loading, disabled
}: {
  onExcelExport: () => void;
  onImageExport: () => void;
  loading: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        onClick={onExcelExport}
        disabled={loading || disabled}
        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-emerald-500/20 dark:shadow-emerald-900/30 shadow-lg"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
        Xuất Excel (.xlsx)
      </Button>
      <Button
        onClick={onImageExport}
        disabled={loading || disabled}
        variant="outline"
        className="border-purple-200 dark:border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 gap-2 transition-all"
      >
        <ImageDown className="h-4 w-4" />
        Xuất Ảnh / PDF
      </Button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export default function ExportDashboardClient({
  receiptDates,
  priceList,
}: ExportDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("warehouse");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [receipts, setReceipts] = useState<ReceiptExportRow[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Refs để chụp ảnh
  const warehouseTableRef = useRef<HTMLDivElement>(null);
  const priceListTableRef = useRef<HTMLDivElement>(null);

  // Convert date strings → Date objects cho calendar modifier
  const importedDays = useMemo(
    () =>
      receiptDates
        .map((d) => parseISO(d))
        .filter(isValid),
    [receiptDates]
  );

  // ── Fetch receipts khi chọn date range ──
  const handleFetchReceipts = useCallback(async () => {
    if (!dateRange?.from) return;
    setLoadingReceipts(true);
    const from = format(dateRange.from, "yyyy-MM-dd");
    const to = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : from;
    const data = await getReceiptsByDateRangeAction(from, to);
    setReceipts(data);
    setLoadingReceipts(false);
  }, [dateRange]);

  // ── Quick select: today / this month ──
  const selectToday = () => {
    const today = new Date();
    setDateRange({ from: today, to: today });
    setReceipts([]);
  };

  const selectThisMonth = () => {
    const now = new Date();
    setDateRange({
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: now,
    });
    setReceipts([]);
  };

  // ── Excel Export (warehouse) ──
  const exportWarehouseExcel = useCallback(async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const data = receipts.map((r) => ({
        "Mã phiếu": r.receiptCode,
        "Ngày nhập": formatDate(r.createdAt),
        "Nhà cung cấp": r.supplierName ?? "—",
        "Số dòng hàng": r.itemCount,
        "Tiền hàng (đ)": Number(r.totalAmount),
        "Vận chuyển (đ)": Number(r.shippingCost),
        "Nhân công (đ)": Number(r.laborCost),
        "Tổng cộng (đ)": Number(r.totalAmount) + Number(r.shippingCost) + Number(r.laborCost),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Nhập Kho");

      const from = dateRange?.from ? format(dateRange.from, "ddMMyyyy") : "all";
      const to = dateRange?.to ? format(dateRange.to, "ddMMyyyy") : from;
      XLSX.writeFile(wb, `nhat-ky-nhap-kho_${from}_${to}.xlsx`);
    } finally {
      setExporting(false);
    }
  }, [receipts, dateRange]);

  // ── Excel Export (price list) ──
  const exportPriceListExcel = useCallback(async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const data = priceList.map((p) => ({
        "Tên sản phẩm": p.name,
        "Giá hiện tại (đ)": Number(p.currentPrice),
        "Giá sỉ / Min (đ)": Number(p.minPrice),
        "Giá lẻ / Max (đ)": Number(p.maxPrice),
        "Tồn kho (cây)": p.totalStock,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bảng Giá");
      XLSX.writeFile(wb, `bang-gia-san-pham_${format(new Date(), "ddMMyyyy")}.xlsx`);
    } finally {
      setExporting(false);
    }
  }, [priceList]);

  // ── Image/PDF Export ──
  const exportAsImage = useCallback(async (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // Detect if we are in dark mode to adjust background for the export
      const isDark = document.documentElement.classList.contains("dark");

      const canvas = await html2canvas(ref.current, {
        scale: 2,
        backgroundColor: isDark ? "#09090b" : "#ffffff",
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`treesystem-export_${format(new Date(), "ddMMyyyy-HHmm")}.pdf`);
    } finally {
      setExporting(false);
    }
  }, []);

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  return (
    <div className="space-y-6 transition-colors duration-300">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-zinc-900/60 backdrop-blur border border-zinc-200 dark:border-white/8 rounded-2xl w-fit shadow-sm">
        <TabButton
          active={activeTab === "warehouse"}
          onClick={() => setActiveTab("warehouse")}
          icon={CalendarIcon}
          label="Nhập Kho"
          count={importedDays.length}
        />
        <TabButton
          active={activeTab === "pricelist"}
          onClick={() => setActiveTab("pricelist")}
          icon={Tag}
          label="Bảng Giá"
          count={priceList.length}
        />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: NHẬP KHO                               */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "warehouse" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Sidebar: Calendar + Filter */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/8 shadow-xl overflow-hidden transition-all">
              <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-600 w-full" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sky-600 dark:text-sky-400 flex items-center gap-2 text-base">
                  <CalendarIcon className="h-4 w-4" /> Chọn khoảng ngày
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Calendar — highlight ngày có phiếu */}
                <div className="flex justify-center">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(r) => {
                      setDateRange(r);
                      setReceipts([]);
                    }}
                    locale={vi}
                    modifiers={{ imported: importedDays }}
                    modifiersClassNames={{
                      imported: "!bg-sky-100 dark:!bg-sky-500/25 !text-sky-600 dark:!text-sky-300 !font-bold !rounded-full",
                    }}
                    className="rounded-xl border border-zinc-100 dark:border-white/5"
                  />
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 px-1">
                  <span className="h-3 w-3 rounded-full bg-sky-100 dark:bg-sky-500/40 border border-sky-400 inline-block" />
                  Ngày có phiếu nhập kho
                </div>

                <Separator className="bg-zinc-100 dark:bg-white/5" />

                {/* Quick select */}
                <div className="space-y-1.5">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">Nhanh</p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: "Hôm nay", action: selectToday },
                      { label: "Tháng này", action: selectThisMonth },
                    ].map(({ label, action }) => (
                      <button
                        key={label}
                        onClick={action}
                        className="text-left px-3 py-2 rounded-xl text-sm text-zinc-600 dark:text-zinc-300 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-300 transition-all flex items-center gap-2 border border-transparent hover:border-sky-200 dark:hover:border-sky-500/20"
                      >
                        <ChevronRight className="h-3 w-3" /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-zinc-100 dark:bg-white/5" />

                {/* Selected range display */}
                {dateRange?.from && (
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-500/8 border border-sky-100 dark:border-sky-500/20 text-sm">
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">Đã chọn:</p>
                    <p className="text-sky-600 dark:text-sky-300 font-medium">
                      {formatDate(dateRange.from)}
                      {dateRange.to && dateRange.to !== dateRange.from && (
                        <> → {formatDate(dateRange.to)}</>
                      )}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full bg-sky-600 hover:bg-sky-700 dark:hover:bg-sky-500 text-white gap-2 transition-all"
                  onClick={handleFetchReceipts}
                  disabled={!dateRange?.from || loadingReceipts}
                >
                  {loadingReceipts
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang tải...</>
                    : <><FileDown className="h-4 w-4" /> Xem dữ liệu</>
                  }
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main: Table + Export */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-zinc-900 dark:text-white text-lg">
                  Kết quả phiếu nhập
                </h2>
                {receipts.length > 0 && (
                  <p className="text-zinc-500 text-sm">{receipts.length} phiếu nhập</p>
                )}
              </div>
              <ExportButtons
                onExcelExport={exportWarehouseExcel}
                onImageExport={() => exportAsImage(warehouseTableRef)}
                loading={exporting}
                disabled={receipts.length === 0}
              />
            </div>

            {/* Printable table */}
            <div ref={warehouseTableRef}>
              <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/8 overflow-hidden shadow-lg transition-all">
                {receipts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-600">
                    <CalendarIcon className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">Chọn khoảng ngày và nhấn &quot;Xem dữ liệu&quot;</p>
                    <p className="text-xs mt-1 text-zinc-500 dark:text-zinc-700">
                      Các ngày có phiếu nhập được highlight trên lịch
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-white/5">
                          {["Mã phiếu", "Ngày nhập", "Nhà cung cấp", "Số dòng", "Tiền hàng", "Phụ phí", "Tổng cộng"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {receipts.map((r, i) => {
                          const total = Number(r.totalAmount) + Number(r.shippingCost) + Number(r.laborCost);
                          return (
                            <tr
                              key={r.id}
                              className={`border-b border-zinc-100 dark:border-white/5 transition-colors ${
                                i % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-zinc-50/30 dark:bg-zinc-900/30"
                              } hover:bg-sky-50 dark:hover:bg-sky-500/5`}
                            >
                              <td className="px-4 py-3 font-mono text-sky-600 dark:text-sky-300 font-medium text-xs">{r.receiptCode}</td>
                              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatDate(r.createdAt)}</td>
                              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{r.supplierName ?? "—"}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-mono">
                                  {r.itemCount}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">{formatVND(r.totalAmount)}</td>
                              <td className="px-4 py-3 text-right font-mono text-zinc-500 dark:text-zinc-500 text-xs">
                                +{formatVND(Number(r.shippingCost) + Number(r.laborCost))}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-zinc-900 dark:text-white font-bold">{formatVND(total)}</td>
                            </tr>
                          );
                        })}
                        {/* Summary row */}
                        <tr className="bg-zinc-100 dark:bg-zinc-900/60 border-t-2 border-sky-200 dark:border-sky-500/30">
                          <td colSpan={4} className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-sm font-semibold">
                            Tổng ({receipts.length} phiếu)
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {formatVND(receipts.reduce((s, r) => s + Number(r.totalAmount), 0))}
                          </td>
                          <td />
                          <td className="px-4 py-3 text-right font-mono text-sky-600 dark:text-sky-300 font-black text-base">
                            {formatVND(
                              receipts.reduce(
                                (s, r) => s + Number(r.totalAmount) + Number(r.shippingCost) + Number(r.laborCost),
                                0
                              )
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: BẢNG GIÁ                              */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "pricelist" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-white text-lg">
                Bảng giá sản phẩm
              </h2>
              <p className="text-zinc-500 text-sm">{priceList.length} sản phẩm đang hoạt động</p>
            </div>
            <ExportButtons
              onExcelExport={exportPriceListExcel}
              onImageExport={() => exportAsImage(priceListTableRef)}
              loading={exporting}
            />
          </div>

          {/* Printable price list */}
          <div ref={priceListTableRef}>
            <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/8 overflow-hidden shadow-lg transition-all">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-white/5">
                      {["Sản phẩm", "Giá bán lẻ (Max)", "Giá sỉ (Min)", "Tồn kho"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {priceList.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`border-b border-zinc-100 dark:border-white/5 transition-colors ${
                          i % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-zinc-50/30 dark:bg-zinc-900/30"
                        } hover:bg-purple-50 dark:hover:bg-purple-500/5`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.imageUrl ? (
                              <div className="h-12 w-12 rounded-xl overflow-hidden relative shrink-0 ring-1 ring-zinc-200 dark:ring-white/10 shadow-sm transition-colors">
                                <Image
                                  src={p.imageUrl}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-white/5 shadow-inner transition-colors">
                                <Package className="h-5 w-5 text-zinc-400 dark:text-zinc-600" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-zinc-900 dark:text-white transition-colors">{p.name}</p>
                              <p className="text-xs text-zinc-500 font-mono">
                                Hiện tại: {formatVND(p.currentPrice)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sky-600 dark:text-sky-400 font-bold text-base transition-colors">
                            {Number(p.maxPrice) > 0 ? formatVND(p.maxPrice) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold transition-colors">
                            {Number(p.minPrice) > 0 ? formatVND(p.minPrice) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${
                              p.totalStock === 0
                                ? "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30"
                                : p.totalStock < 10
                                ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                                : "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                            }`}
                          >
                            {p.totalStock} cây
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {priceList.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-600">
                    <BarChart2 className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">Chưa có sản phẩm nào</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
