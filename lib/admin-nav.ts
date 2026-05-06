import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Database,
  ClipboardList,
  History,
  Truck,
  Banknote,
  FileDown,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export type AdminNavGroup = {
  label: string;
  items: readonly AdminNavItem[];
};

/** Cấu hình menu admin — một nơi duy nhất để tránh lệch route / nhãn. */
export const adminNavGroups: readonly AdminNavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/sales-today", icon: Receipt, label: "Doanh số hôm nay" },
    ],
  },
  {
    label: "Quản lý hàng hóa",
    items: [
      { href: "/admin/products", icon: Package, label: "Sản phẩm" },
      { href: "/admin/categories", icon: Database, label: "Danh mục" },
      { href: "/admin/inventory", icon: ClipboardList, label: "Tồn kho (theo lô)" },
    ],
  },
  {
    label: "Vận hành",
    items: [
      { href: "/admin/warehouse", icon: History, label: "Nhập kho" },
      { href: "/admin/suppliers", icon: Truck, label: "Nhà cung cấp" },
    ],
  },
  {
    label: "Báo cáo",
    items: [
      { href: "/admin/finance", icon: Banknote, label: "Thống kê tài chính" },
      { href: "/admin/export", icon: FileDown, label: "Xuất dữ liệu" },
    ],
  },
] as const;

/** Active cho route đúng hoặc route con (vd. /admin/products/... sau này). */
export function isAdminNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
