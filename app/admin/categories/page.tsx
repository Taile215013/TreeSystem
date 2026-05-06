import Link from "next/link";
import { categoryService } from "@/features/categories/services/category.service";
import { Database, FolderTree, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminCategoriesPage() {
  const rows = await categoryService.listWithProductCount();

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Danh mục</h1>
            <Badge variant="secondary">{rows.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Nhóm sản phẩm dùng trong form sản phẩm. Số lượng là tổng SKU gắn danh mục.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <Package className="h-4 w-4" />
          Quản lý sản phẩm
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-muted-foreground">
            <FolderTree className="h-10 w-10 opacity-50" />
            <p className="text-sm">Chưa có danh mục. Thêm qua migration/seed hoặc công cụ DB.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[72px]">ID</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Sản phẩm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-muted-foreground">{row.id}</TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                      <Database className="h-3.5 w-3.5" />
                      {row.slug}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.productCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
