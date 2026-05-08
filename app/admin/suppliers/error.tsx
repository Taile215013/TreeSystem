"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function SuppliersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Suppliers Page Error:", error);
  }, [error]);

  return (
    <div className="p-4 sm:p-8">
      <ErrorDisplay 
        error={error} 
        reset={reset} 
        title="Lỗi tải danh mục đối tác"
        description="Dữ liệu nhà cung cấp và nhà vườn đang gặp sự cố kết nối. Vui lòng thử lại sau giây lát."
      />
    </div>
  );
}
