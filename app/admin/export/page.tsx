import { getReceiptDatesAction, getPriceListAction } from "@/features/export/actions/export.actions";

import ExportDashboardClient from "./ExportDashboardClient";
import { FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Xuất Dữ Liệu — TreeSystem Admin",
};

export default async function ExportPage() {
  const [receiptDates, priceList] = await Promise.all([
    getReceiptDatesAction(),
    getPriceListAction(),
  ]);

  return (
    <div className="w-full transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="border-sky-500/50 text-sky-600 dark:text-sky-400 bg-sky-500/5 px-3 py-1"
              >
                Export Center
              </Badge>
              <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
                v1.0
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">
              Xuất{" "}
              <span className="text-sky-600 dark:text-sky-400">Dữ Liệu</span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-3 max-w-xl leading-relaxed">
              Xuất báo cáo nhập kho và bảng giá sản phẩm. Hỗ trợ định dạng{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Excel (.xlsx)</span> và{" "}
              <span className="text-purple-600 dark:text-purple-400 font-semibold">Ảnh / PDF</span>.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            {receiptDates.length} phiếu nhập · {priceList.length} sản phẩm
          </div>
        </div>

        {/* Client Component */}
        <ExportDashboardClient
          receiptDates={receiptDates}
          priceList={priceList}
        />
      </div>
    </div>
  );
}
