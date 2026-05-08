import { supplierService } from "@/features/suppliers/services/supplier.service";
import { SupplierForm } from "@/features/suppliers/components/SupplierForm";
import SuppliersDashboardClient from "@/features/suppliers/components/SuppliersDashboardClient";
import { Truck } from "lucide-react";

export default async function SuppliersPage() {
  const suppliers = await supplierService.getAll();

  return (
    <div className="space-y-8 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Truck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Nhà Cung Cấp</h1>
            <p className="text-zinc-500 text-sm">Quản lý mạng lưới đối tác và nhà vườn cung cấp cây</p>
          </div>
        </div>
        <SupplierForm />
      </div>

      {/* Main Dashboard */}
      <SuppliersDashboardClient initialData={suppliers} />
    </div>
  );
}

