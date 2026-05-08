"use client";

import React, { useState } from 'react';
import {
  Leaf, Truck, Users, Calendar as CalendarIcon,
  Plus, Trash2, ArrowRight, ArrowLeft,
  ShoppingBag, Info, Calculator, Banknote, Loader2, MapPin
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { createReceiptAction } from '@/features/warehouse/actions/warehouse.actions';
import { useRouter } from 'next/navigation';

// --- Types ---
type ImportStep = 'general' | 'products';

interface ImportItem {
  id: string;
  productId: number;
  quantity: number; // Thêm lại trường số lượng bị thiếu
  unit?: string;
  supplierId?: number;
  importPrice: number;
  minPrice: number;
  maxPrice: number;
  notes?: string;
}

interface WarehouseFormProps {
  initialData: {
    products: { id: number, name: string }[];
    locations: { id: number, name: string }[];
    suppliers: { id: number, name: string }[];
  }
}

export default function WarehouseForm({ initialData }: WarehouseFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>('general');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });

  // Form State
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [laborCost, setLaborCost] = useState<number>(0);
  const [locationId, setLocationId] = useState<string>(initialData.locations[0]?.id.toString() || "");
  const [supplierId, setSupplierId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // Công thức mã: (NĂM THÁNG NGÀY) + THỨ + SUFFIX (In hoa)
  // Ví dụ: 20260508FRI-875
  const generateReceiptCode = () => {
    const now = new Date();
    const dateStr = format(now, 'yyyyMMdd');
    // Lấy thứ viết tắt bằng tiếng Anh (MON, TUE...) và in hoa
    const dayStr = format(now, 'EEE', { locale: undefined }).toUpperCase(); 
    const randomStr = Math.floor(100 + Math.random() * 900).toString();
    return `${dateStr}${dayStr}-${randomStr}`;
  };

  const [receiptCode, setReceiptCode] = useState<string>(generateReceiptCode());


  const [items, setItems] = useState<ImportItem[]>([
    { id: Math.random().toString(36).substr(2, 9), productId: 0, quantity: 1, importPrice: 0, minPrice: 0, maxPrice: 0 }
  ]);

  const addItem = () => {
    setItems([...items, {
      id: Math.random().toString(36).substr(2, 9),
      productId: 0, quantity: 1,
      importPrice: 0, minPrice: 0, maxPrice: 0,
      unit: "", notes: ""
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ImportItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Nếu thay đổi giá nhập, tự động cập nhật giá bán tối thiểu (Min)
        if (field === 'importPrice') {
          updatedItem.minPrice = value;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const totalProductCost = items.reduce((acc, curr) => acc + (curr.quantity * curr.importPrice), 0);
  const finalTotal = totalProductCost + Number(shippingCost) + Number(laborCost);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage({ text: '', type: null });
    try {
      const response = await createReceiptAction({
        receiptCode,
        supplierId: supplierId ? Number(supplierId) : null,
        locationId: Number(locationId),
        shippingCost,
        laborCost,
        notes,
        items: items.map(({ productId, importPrice, quantity, unit, supplierId, notes, minPrice, maxPrice }) => ({
          productId,
          importPrice,
          quantity,
          unit,
          supplierId,
          notes,
          minPrice: minPrice || 0,
          maxPrice: maxPrice || 0,
        }))
      });

      if (response.success) {
        setMessage({ text: response.message, type: 'success' });
        setTimeout(() => {
          router.push("/admin/products");
        }, 2000);
      } else {
        setMessage({ text: response.message || "Đã có lỗi xảy ra", type: 'error' });
      }
    } catch (error: any) {
      setMessage({ text: "Lỗi kết nối server: " + (error.message || "Unknown error"), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Workspace */}
      <div className="space-y-6">
        {/* Step Indicator Header */}
        <div className="flex items-center gap-3 p-1.5 bg-pink-100/80 border border-pink-200 rounded-2xl backdrop-blur-md mb-4 w-fit">
          <div
            onClick={() => setStep('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${step === 'general' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-pink-500 hover:text-pink-700'}`}
          >
            <CalendarIcon size={18} /> <span className="text-sm font-bold">Thông tin chung</span>
          </div>
          <div className="w-6 h-px bg-pink-200" />
          <div
            onClick={() => setStep('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${step === 'products' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-pink-500 hover:text-pink-700'}`}
          >
            <ShoppingBag size={18} /> <span className="text-sm font-bold">Sản phẩm</span>
          </div>
        </div>

        {step === 'general' && (
          <Card className="bg-pink-50 border-pink-200 shadow-2xl overflow-hidden rounded-3xl">
            <div className="h-1.5 bg-primary w-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary"><Info size={20} /> Thiết lập phiếu nhập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-pink-700">Mã phiếu (Tự động)</Label>
                  <Input
                    className="bg-white border-pink-200 focus:border-primary/50 rounded-xl text-zinc-900"
                    value={receiptCode}
                    onChange={(e) => setReceiptCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-700 flex items-center gap-2"><MapPin size={14} /> Vị trí nhập kho</Label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger className="bg-white border-pink-200 text-zinc-900 rounded-xl">
                      <SelectValue placeholder="Chọn kho..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-zinc-900 border-pink-200">
                      {initialData.locations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-pink-700">Ngày nhập kho</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full bg-white border-pink-200 justify-start text-left text-zinc-700 rounded-xl">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "EEEE, dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-white border-pink-200 text-zinc-900 p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-700">Nhà cung cấp chính (Tùy chọn)</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="bg-white border-pink-200 text-zinc-900 rounded-xl">
                      <SelectValue placeholder="Chọn NCC..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-zinc-900 border-pink-200">
                      <SelectItem value="0">--- Trống ---</SelectItem>
                      {initialData.suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-pink-200/50" />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-pink-700 flex items-center gap-2"><Truck size={14} /> Tiền vận chuyển (VNĐ)</Label>
                  <Input
                    type="number"
                    className="bg-white border-pink-200 focus:border-primary/50 rounded-xl text-zinc-900"
                    placeholder="0"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-700 flex items-center gap-2"><Users size={14} /> Tiền nhân công (VNĐ)</Label>
                  <Input
                    type="number"
                    className="bg-white border-pink-200 focus:border-primary/50 rounded-xl text-zinc-900"
                    placeholder="0"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-pink-700">Ghi chú phiếu nhập</Label>
                <textarea
                  className="w-full bg-white border border-pink-200 rounded-xl p-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                  placeholder="Nhập nội dung ghi chú..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'products' && (
          <Card className="bg-pink-50 border-pink-200 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-pink-200 bg-pink-100/30">
              <CardTitle className="flex items-center gap-2 text-primary"><Leaf size={20} /> Chi tiết hoa kiểng</CardTitle>
              <Button onClick={addItem} className="bg-primary hover:bg-primary/90 rounded-xl">
                <Plus size={16} className="mr-2" /> Thêm dòng mới
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-pink-100/50">
                  <TableRow className="border-pink-200 hover:bg-transparent">
                    <TableHead className="text-pink-800 text-xs">Sản phẩm</TableHead>
                    <TableHead className="text-pink-800 text-xs text-center w-24">SL</TableHead>
                    <TableHead className="text-pink-800 text-xs w-24">ĐVT</TableHead>
                    <TableHead className="text-pink-800 text-xs text-right">Giá nhập</TableHead>
                    <TableHead className="text-pink-800 text-xs text-right">Giá Min</TableHead>
                    <TableHead className="text-pink-800 text-xs text-right">Giá Max</TableHead>
                    <TableHead className="text-pink-800 text-xs">Ghi chú</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="border-pink-100 hover:bg-pink-100/20">
                      <TableCell>
                        <Select
                          value={item.productId.toString()}
                          onValueChange={(val) => updateItem(item.id, 'productId', Number(val))}
                        >
                          <SelectTrigger className="bg-white border-pink-100 w-[180px] text-zinc-900 rounded-lg">
                            <SelectValue placeholder="Chọn cây..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-zinc-900 border-pink-200">
                            {initialData.products.map(p => (
                              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-20 mx-auto bg-white border-pink-100 text-zinc-900 rounded-lg text-center"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="..."
                          className="w-20 bg-white border-pink-100 text-zinc-900 text-xs rounded-lg"
                          value={item.unit || ""}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          className="w-28 ml-auto bg-white border-pink-100 text-right font-mono text-primary rounded-lg"
                          value={item.importPrice}
                          onChange={(e) => updateItem(item.id, 'importPrice', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          className="w-28 ml-auto bg-white border-pink-100 text-right font-mono text-[var(--complementary)] rounded-lg"
                          value={item.minPrice}
                          onChange={(e) => updateItem(item.id, 'minPrice', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          className="w-28 ml-auto bg-white border-pink-100 text-right font-mono text-sky-600 rounded-lg"
                          value={item.maxPrice}
                          onChange={(e) => updateItem(item.id, 'maxPrice', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="..."
                          className="w-16 bg-white border-pink-100 text-zinc-900 text-[10px] rounded-lg"
                          value={item.notes || ""}
                          onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-pink-400 hover:text-red-500 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer Summary Card */}
      <div className="space-y-4">
        <Card className="bg-pink-100/50 border-pink-200 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap gap-8 items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Tiền hàng</span>
                <p className="text-xl font-mono text-zinc-900">{totalProductCost.toLocaleString()}đ</p>
              </div>
              <div className="h-8 w-px bg-pink-200 hidden md:block" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Vận chuyển & Công</span>
                <p className="text-xl font-mono text-pink-800">+{(Number(shippingCost) + Number(laborCost)).toLocaleString()}đ</p>
              </div>
              <div className="h-8 w-px bg-pink-200 hidden md:block" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Tổng cộng</span>
                <p className="text-3xl font-black text-primary font-mono">{finalTotal.toLocaleString()}đ</p>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-3 min-w-[280px]">
              {step === 'general' ? (
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                  onClick={() => setStep('products')}
                >
                  Tiếp tục chọn sản phẩm
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Xác nhận nhập kho"}
                  </Button>
                  <Button variant="ghost" className="text-pink-600 hover:text-pink-900" onClick={() => setStep('general')}>
                    <ArrowLeft size={16} className="mr-2" /> Quay lại thiết lập
                  </Button>
                </div>
              )}

              {message.text && (
                <div className={`text-sm p-3 rounded-xl border flex items-center gap-2 ${message.type === 'success' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}`}>
                   {message.type === 'success' ? <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> : <div className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                   {message.text}
                </div>
              )}
            </div>
          </div>
          <div className="bg-pink-100/30 p-3 px-8 text-[10px] text-pink-700/60 italic flex items-center gap-2 border-t border-pink-200">
            <Info size={14} />
            Lưu ý: Mọi thay đổi về giá nhập sẽ được hệ thống cập nhật tự động vào giá thị trường hiện tại.
          </div>
        </Card>
      </div>
    </div>
  );
}
