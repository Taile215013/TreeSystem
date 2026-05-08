"use client";

import { useTransition, useState } from "react";
import { deleteProductAction } from "../actions/product.actions";
import { Trash2, Loader2, Lock, AlertTriangle, ShieldCheck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteProductButtonProps {
  id: number;
  isAdmin: boolean;
}

// Câu hỏi bảo mật dạng chọn đáp án (Exported for consistency if needed elsewhere)
export const QUESTIONS = [
  {
    q: "1 + 1 bằng mấy?",
    choices: [
      { text: "3", correct: false },
      { text: "2", correct: true },
      { text: "11", correct: false },
      { text: "0", correct: false },
    ],
  },
  // ... (keep others for reference or export)
];

export function DeleteProductButton({ id, isAdmin }: DeleteProductButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"trash" | "permanent">("trash");

  if (!isAdmin) {
    return (
      <div className="p-2 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-40">
        <Lock className="h-4 w-4" />
      </div>
    );
  }

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await deleteProductAction(id, deleteMode);
      if (res.success) {
        setOpen(false);
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); }}>
      <DialogTrigger asChild>
        <button
          title="Xóa sản phẩm"
          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl sm:max-w-[420px] overflow-hidden p-0 shadow-2xl">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />

        <div className="p-5 sm:p-6">
          <DialogHeader>
            <div className="mx-auto h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center mb-3 ring-4 ring-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-center text-lg font-black tracking-tight">
              Xác nhận xóa sản phẩm
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mt-1">
              Bạn có chắc chắn muốn xóa sản phẩm này? Hãy chọn hình thức xóa phù hợp.
            </DialogDescription>
          </DialogHeader>

          {/* === DELETE MODE SELECTION === */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeleteMode("trash")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                deleteMode === "trash"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-200"
              }`}
            >
              <Trash2 className="h-4 w-4 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Thùng rác</span>
              <span className="text-[8px] opacity-60">(Lưu 2 tuần)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeleteMode("permanent")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                deleteMode === "permanent"
                  ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                  : "border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-200"
              }`}
            >
              <AlertTriangle className="h-4 w-4 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Xóa vĩnh viễn</span>
              <span className="text-[8px] opacity-60">(Mất hoàn toàn)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-6">
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className={`w-full ${deleteMode === "permanent" ? "bg-red-600 hover:bg-red-700 shadow-red-600/25" : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/25"} text-white font-black text-xs uppercase tracking-wider h-11 rounded-xl shadow-lg disabled:opacity-30 disabled:shadow-none transition-all`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="h-4 w-4 mr-2" />
              )}
              {deleteMode === "permanent" ? "Xác nhận xóa vĩnh viễn" : "Chuyển vào thùng rác"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-[10px] font-bold h-9"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
