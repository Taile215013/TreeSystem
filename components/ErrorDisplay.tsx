"use client";

import React from "react";
import { AlertCircle, RefreshCw, Database, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function ErrorDisplay({ error, reset, title, description }: ErrorDisplayProps) {
  const isConnectionError = error.message.toLowerCase().includes("database") || 
                           error.message.toLowerCase().includes("connection") ||
                           error.message.toLowerCase().includes("postgres");

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-zinc-900/50 rounded-3xl border border-red-500/10 backdrop-blur-xl text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-2xl">
          {isConnectionError ? <Database size={40} /> : <ServerCrash size={40} />}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-zinc-950 p-1 rounded-lg border border-red-500/20">
          <AlertCircle size={16} className="text-red-500" />
        </div>
      </div>

      <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
        {title || (isConnectionError ? "Lỗi kết nối dữ liệu" : "Đã có sự cố xảy ra")}
      </h2>
      
      <p className="text-zinc-500 text-sm max-w-md mb-8 leading-relaxed">
        {description || (isConnectionError 
          ? "Hệ thống không thể kết nối tới cơ sở dữ liệu. Vui lòng kiểm tra lại đường truyền hoặc thử lại sau ít phút."
          : "Đã xảy ra lỗi không mong muốn trong quá trình xử lý. Đội ngũ kỹ thuật đã được thông báo.")}
      </p>

      {/* Error detail (collapsed by default) */}
      <details className="w-full max-w-sm mb-8 text-left">
        <summary className="text-[10px] text-zinc-600 cursor-pointer hover:text-zinc-400 font-bold uppercase tracking-widest outline-none">
          Chi tiết kỹ thuật
        </summary>
        <div className="mt-2 p-3 bg-black/50 rounded-xl border border-white/5 font-mono text-[10px] text-red-400/80 break-all">
          {error.message}
          {error.digest && <div className="mt-1 opacity-50 italic">Digest: {error.digest}</div>}
        </div>
      </details>

      <Button
        onClick={reset}
        className="bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest px-8 h-12 rounded-xl shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 group"
      >
        <RefreshCw size={16} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
        Thử kết nối lại
      </Button>
    </div>
  );
}
