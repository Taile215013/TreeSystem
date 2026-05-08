import { getInventoryAction } from "@/features/inventory/actions/inventory.actions";
import InventoryTable from "@/features/inventory/components/InventoryTable";

export const dynamic = 'force-dynamic';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function InventoryPage() {
  const response = await getInventoryAction();

  if (!response.success || !response.data) {
    return (
      <div className="w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi dữ liệu</AlertTitle>
          <AlertDescription>
            {response.message || "Không thể tải danh sách tồn kho lúc này."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <InventoryTable data={response.data} />
    </div>
  );
}
