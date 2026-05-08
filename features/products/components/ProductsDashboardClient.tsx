"use client";

import { useState, useEffect } from "react";
import { ProductTable, Product } from "./ProductTable";
import { ProductForm } from "./ProductForm";
import { Package, Plus, ChevronRight, ChevronLeft, PanelRightClose, PanelRightOpen, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminNotification } from "@/lib/stores/admin-notification";

interface ProductsDashboardClientProps {
  allProducts: Product[];
  isAdmin: boolean;
}

export function ProductsDashboardClient({ allProducts, isAdmin }: ProductsDashboardClientProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { addNotification } = useAdminNotification();

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 1280;
      setIsMobile(mobile);
      if (!mobile) setIsFormVisible(true);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Quét danh sách sản phẩm để tìm cảnh báo
  useEffect(() => {
    if (!allProducts || allProducts.length === 0) return;

    const timer = setTimeout(() => {
      // Quét thiếu ảnh
      const missingImageProducts = allProducts.filter(p => !p.imageUrl);
      if (missingImageProducts.length > 0) {
        addNotification({
          id: `missing-image-group`,
          type: "warning",
          title: `Thiếu hình ảnh (${missingImageProducts.length})`,
          description: `Có ${missingImageProducts.length} sản phẩm chưa có hình ảnh. Nhấn để làm nổi bật tất cả.`,
          elementIds: missingImageProducts.map(p => `product-${p.id}`),
          action: { label: "Xem chi tiết", onClick: () => {} },
        });
      }

      // Quét thiếu danh mục
      const missingCategoryProducts = allProducts.filter(p => !p.categoryId);
      if (missingCategoryProducts.length > 0) {
        addNotification({
          id: `missing-category-group`,
          type: "error",
          title: `Thiếu danh mục (${missingCategoryProducts.length})`,
          description: `Có ${missingCategoryProducts.length} sản phẩm chưa được phân loại vào danh mục nào.`,
          elementIds: missingCategoryProducts.map(p => `product-${p.id}`),
          action: { label: "Kiểm tra", onClick: () => {} },
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [allProducts, addNotification]);

  return (
    <div className="flex flex-col xl:flex-row gap-4 md:gap-8 items-start relative min-h-screen max-w-[1600px] mx-auto px-0.5 sm:px-4">
      {/* 📱 Compact Mobile Header 📱 */}
      <div className="xl:hidden w-full flex items-center justify-between px-3 py-3 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-30 border-b border-border/10">
         <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
               <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">Cửa hàng</h2>
               <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{allProducts.length} cây</span>
            </div>
         </div>
         <Button 
            onClick={() => setIsFormVisible(true)}
            size="sm"
            className="h-8 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-[9px] uppercase tracking-wider shadow-lg active:scale-95 transition-all"
         >
            <Plus className="h-3 w-3 mr-1.5" />
            Thêm mới
         </Button>
      </div>

      {/* Table/Data Section */}
      <div className={`flex-1 w-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isFormVisible && !isMobile ? "xl:w-[65%] 2xl:w-[75%]" : "w-full"}`}>
        <div className="hidden xl:flex items-center justify-between px-2 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Package className="h-5 w-5 text-primary" />
              Kho hàng hiện tại
            </h3>
            {!isFormVisible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFormVisible(true)}
                className="h-8 px-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Mở bảng tạo mới
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white/40 dark:bg-card/20 backdrop-blur-xl border-t sm:border border-border/20 sm:rounded-[2rem] shadow-xl overflow-hidden transition-all duration-500">
          <ProductTable products={allProducts} isAdmin={isAdmin} />
        </div>
      </div>

      {/* Form Section (Optimized Overlay for Mobile) */}
      <div
        className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] fixed xl:relative inset-0 z-50 xl:z-auto bg-zinc-50 dark:bg-zinc-950 xl:bg-transparent
          ${isFormVisible
            ? "translate-y-0 opacity-100 xl:w-[35%] 2xl:w-[25%]"
            : "translate-y-full xl:translate-y-0 opacity-0 xl:opacity-100 xl:w-0 xl:max-w-16 pointer-events-none xl:pointer-events-auto"
          }`}
      >
        <div className="h-full flex flex-col p-4 xl:p-0">
            {/* Mobile Close Bar (Compact) */}
            <div className="xl:hidden flex items-center justify-between mb-4">
               <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsFormVisible(false)}
                  className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-white/5"
               >
                  <ArrowLeft className="h-4 w-4" />
               </Button>
               <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Tạo sản phẩm</h3>
               <div className="w-10" />
            </div>

            {isFormVisible ? (
              <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide xl:pr-2">
                <div className="hidden xl:flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white">
                      <Plus className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.2em]">Tạo mới</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFormVisible(false)}
                    className="h-9 w-9 rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10"
                  >
                    <PanelRightClose className="h-4 w-4" />
                  </Button>
                </div>

                <div className="xl:sticky xl:top-24 bg-white dark:bg-zinc-900/40 backdrop-blur-2xl p-1.5 rounded-[2rem] border border-border/20 shadow-2xl">
                  <ProductForm />
                </div>
              </div>
            ) : (
              <div
                className="hidden xl:flex flex-col items-center py-10 sticky top-24 h-[600px] bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-border/40 rounded-[2.5rem] animate-in slide-in-from-right-8 duration-700 cursor-pointer shadow-xl"
                onClick={() => setIsFormVisible(true)}
              >
                <div className="flex flex-col items-center gap-8 h-full">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xl"><Plus className="h-5 w-5" /></Button>
                  <div className="flex-1 flex flex-col items-center justify-center gap-16">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 [writing-mode:vertical-rl] rotate-180 transition-colors group-hover:text-primary">Panel TẠO MỚI</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-400"><PanelRightOpen className="h-5 w-5" /></Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
