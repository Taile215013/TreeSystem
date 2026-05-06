import { productService } from "@/features/products/services/product.service";
import { checkIsAdminAction } from "@/features/products/actions/product.actions";
import { ProductsDashboardClient } from "@/features/products/components/ProductsDashboardClient";
import { Package, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminProductsPage() {
  const [allProducts, isAdmin] = await Promise.all([
    productService.getAll(undefined, 500),
    checkIsAdminAction(),
  ]);

  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Quản lý sản phẩm
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 rounded-full text-xs">
              {allProducts.length} cây
            </Badge>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
            Hệ thống quản lý danh mục cây cảnh thông minh, tự động cập nhật trạng thái và giá bán theo thị trường.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-sm text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Admin Control Center
          </div>
        )}
      </div>

      <ProductsDashboardClient allProducts={allProducts} isAdmin={isAdmin} />
    </div>
  );
}
