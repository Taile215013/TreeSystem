// Types shared giữa Server Actions và Client Components
// Không đặt "use server" ở đây — file thuần TypeScript

export interface ReceiptExportRow {
  id: number;
  receiptCode: string;
  supplierName: string | null;
  totalAmount: string;
  shippingCost: string;
  laborCost: string;
  createdAt: Date | null;
  itemCount: number;
}

export interface PriceListRow {
  id: number;
  name: string;
  imageUrl: string | null;
  currentPrice: string;
  minPrice: string;
  maxPrice: string;
  totalStock: number;
}
