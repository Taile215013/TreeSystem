"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log lỗi để theo dõi (có thể gửi về Sentry hoặc log server)
    console.error("Products Page Error:", error);
  }, [error]);

  return (
    <div className="p-4 sm:p-8">
      <ErrorDisplay 
        error={error} 
        reset={reset} 
        title="Lỗi tải danh sách sản phẩm"
        description="Không thể hiển thị dữ liệu sản phẩm ngay lúc này. Điều này thường do sự cố tạm thời của hệ thống cơ sở dữ liệu."
      />
    </div>
  );
}
