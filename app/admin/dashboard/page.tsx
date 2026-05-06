import { getDashboardDataAction } from "@/features/dashboard/actions/dashboard.actions";
import DashboardContent from "./Dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function AdminDashboardPage() {
  const response = await getDashboardDataAction();

  if (!response.success || !response.data) {
    return (
      <div className="w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi hệ thống</AlertTitle>
          <AlertDescription>
            {response.message || "Không thể tải dữ liệu thống kê lúc này. Vui lòng thử lại sau."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loại bỏ các wrapper h-screen, bg-black cứng để AdminShell quản lý
  return (
    <div className="w-full animate-in fade-in duration-500">
      <DashboardContent data={response.data} />
    </div>
  );
}
