"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, Users, Phone, MapPin, Loader2, Save, X, Image as ImageIcon, Ruler, Building2, TreePine
} from 'lucide-react';


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supplierSchema, SupplierInput } from "../schemas/supplier.schema";
import { createSupplierAction, updateSupplierAction } from "../actions/supplier.actions";

interface SupplierFormProps {
  initialData?: any; // Use any or a partial type to avoid strict mismatches with initial DB state
  onSuccess?: () => void;
}

export function SupplierForm({ initialData, onSuccess }: SupplierFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData ? {
      ...initialData,
      imageUrl: initialData.imageUrl || "",
      specifications: initialData.specifications || "",
      type: initialData.type || "garden"
    } : { name: "", phone: "", address: "", imageUrl: "", specifications: "", type: "garden" }
  });



  const onSubmit = async (data: SupplierInput) => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = initialData?.id 
        ? await updateSupplierAction(initialData.id, data)
        : await createSupplierAction(data);

      if (response.success) {
        reset();
        setIsOpen(false);
        onSuccess?.();
      } else {
        setError(response.message || "Đã có lỗi xảy ra");
      }
    } catch (err) {
      setError("Lỗi kết nối Server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/20"
      >
        <Plus size={18} className="mr-2" /> 
        {initialData ? "Sửa" : "Thêm nhà cung cấp"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="h-1.5 bg-emerald-500 w-full" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <Users className="text-emerald-500" /> 
                  {initialData ? "Cập nhật" : "Nhà cung cấp mới"}
                </h2>
                <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Tên nhà cung cấp <span className="text-red-500">*</span></Label>
                  <Input 
                    {...register("name")}
                    placeholder="VD: Nhà vườn Ba Trúc..." 
                    className="bg-zinc-900 border-white/5 h-12 rounded-xl focus:ring-emerald-500/50 text-white"
                  />
                  {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Phân loại</Label>
                    <select
                      {...register("type")}
                      className="w-full bg-zinc-900 border border-white/5 h-12 rounded-xl px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                    >
                      <option value="garden">🏡 Nhà vườn</option>
                      <option value="provider">🏢 Nơi cung cấp</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Hình ảnh (URL)</Label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <Input 
                        {...register("imageUrl")}
                        placeholder="https://..." 
                        className="pl-10 bg-zinc-900 border-white/5 h-12 rounded-xl focus:ring-emerald-500/50 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Quy cách / Kích thước</Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <Input 
                      {...register("specifications")}
                      placeholder="VD: Chậu C7-C15, cao 1m-2m..." 
                      className="pl-10 bg-zinc-900 border-white/5 h-12 rounded-xl focus:ring-emerald-500/50 text-white"
                    />
                  </div>
                </div>


                <div className="space-y-2">
                  <Label className="text-zinc-400">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <Input 
                      {...register("phone")}
                      placeholder="09xxx..." 
                      className="pl-10 bg-zinc-900 border-white/5 h-12 rounded-xl focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Địa chỉ</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 text-zinc-600" size={16} />
                    <textarea 
                      {...register("address")}
                      rows={3}
                      placeholder="Địa chỉ nhà vườn..." 
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                {error && <p className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm italic">{error}</p>}

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsOpen(false)}
                    className="flex-1 h-12 rounded-xl text-zinc-400 hover:text-white"
                  >
                    Hủy bỏ
                  </Button>
                  <Button 
                    disabled={isSubmitting}
                    className="flex-[2] h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                    {initialData ? "Lưu thay đổi" : "Tạo ngay"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
