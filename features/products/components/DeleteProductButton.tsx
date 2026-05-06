"use client";

import { useTransition, useState } from "react";
import { deleteProductAction } from "../actions/product.actions";
import { Trash2, Loader2, Lock, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DeleteProductButtonProps {
  id: number;
  isAdmin: boolean;
}

const QUESTIONS = [
  { q: "1 + 1 bằng mấy?", a: "2" },
  { q: "Cây cần gì để sống? (Nước/Trà sữa)", a: "nước" },
  { q: "Lá cây thường có màu gì? (Xanh/Đỏ)", a: "xanh" },
  { q: "Con bò ăn gì? (Cỏ/Pizza)", a: "cỏ" },
];

export function DeleteProductButton({ id, isAdmin }: DeleteProductButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [question] = useState(() => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]);

  if (!isAdmin) {
    return (
      <div className="p-2 text-zinc-600 cursor-not-allowed">
        <Lock className="h-4 w-4" />
      </div>
    );
  }

  const handleDelete = () => {
    if (answer.toLowerCase().trim() !== question.a.toLowerCase()) {
      alert("⚠️ Câu trả lời sai rồi! Bạn có thực sự là Admin không đấy? 🤨");
      return;
    }

    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (res.success) {
        setOpen(false);
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          title="Xóa sản phẩm"
          className="p-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 rounded-lg border border-red-500/20 transition-all active:scale-90"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-2xl sm:max-w-[400px] overflow-hidden p-4 sm:p-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500" />
        
        <DialogHeader className="pt-2">
          <div className="mx-auto h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center mb-1">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <DialogTitle className="text-center text-lg font-black uppercase tracking-tight">Xác nhận xóa!</DialogTitle>
          <DialogDescription className="text-center text-zinc-400 text-[11px] leading-relaxed">
            Hành động này sẽ chuyển sản phẩm vào kho lưu trữ. Hãy trả lời câu hỏi sau để tiếp tục:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Câu hỏi bảo mật</span>
            <p className="text-base font-black text-primary mt-0.5">{question.q}</p>
          </div>
          
          <Input
            placeholder="Nhập câu trả lời..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="bg-zinc-900 border-white/10 rounded-xl h-10 text-center text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleDelete()}
          />
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleDelete}
            disabled={isPending || !answer}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-wider h-11 rounded-xl shadow-lg shadow-red-900/20"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1.5 h-4 w-4" />}
            Xác nhận xóa vĩnh viễn
          </Button>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="w-full text-zinc-500 hover:text-white text-[10px] font-bold"
          >
            Hủy bỏ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
