"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function WarehouseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Warehouse Page Error:", error);
  }, [error]);

  return (
    <div className="p-4 sm:p-8">
      <ErrorDisplay 
        error={error} 
        reset={reset} 
        title="Lỗi tải dữ liệu kho"
        description="Không thể kết nối tới hệ thống quản lý kho. Dữ liệu tồn kho và phiếu nhập có thể không khả dụng lúc này."
      />
    </div>
  );
}
