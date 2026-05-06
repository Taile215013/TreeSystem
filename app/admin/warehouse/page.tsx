import { getWarehouseFormDataAction, getWarehouseHistoryAction } from "@/features/warehouse/actions/warehouse.actions";
import WarehouseForm from "./WarehouseForm";
import WarehouseHistory from "./WarehouseHistory";
import { Badge } from "@/components/ui/badge";

export default async function WarehousePage() {
  // Fetch data on the server for best performance and SEO
  const [initialData, history] = await Promise.all([
    getWarehouseFormDataAction(),
    getWarehouseHistoryAction(10)
  ]);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-[1500px] mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-2 py-0.5 rounded-full text-[10px] font-bold">
                WMS Pro v2.0
              </Badge>
              <div className="h-1 w-1 rounded-full bg-[var(--complementary)] animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Warehouse Intel</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Quản lý <span className="text-primary">Nhập Kho</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-lg text-sm leading-relaxed">
              Khởi tạo phiếu nhập, điều phối vị trí lưu trữ và quản lý chi phí vận hành thông minh trong một giao diện tập trung.
            </p>
          </div>

          <div className="hidden lg:block text-right">
            <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Hệ thống</div>
            <div className="flex items-center gap-2 justify-end text-primary font-bold text-xs">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              Database Connected
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Main Form Component */}
          <div className="xl:col-span-8 2xl:col-span-9 space-y-6">
            <div className="flex items-center gap-2 px-2">
               <div className="h-7 w-7 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary" />
               </div>
               <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest">Tạo Phiếu Nhập Mới</h2>
            </div>
            <div className="bg-white/70 dark:bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl shadow-xl dark:shadow-none p-1">
              <WarehouseForm initialData={initialData} />
            </div>
          </div>

          {/* History Section */}
          <div className="xl:col-span-4 2xl:col-span-3 space-y-6">
            <div className="flex items-center gap-2 px-2">
               <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest">Lịch sử gần đây</h2>
               <div className="ml-auto px-2 py-0.5 rounded-full bg-[var(--complementary)]/10 text-[var(--complementary)] text-[10px] font-bold">Live</div>
            </div>
            <WarehouseHistory history={history} />
          </div>
        </div>

      </div>
    </div>
  );
}