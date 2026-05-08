"use client";

import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { optimizeImageToWebp } from "@/lib/image-optimizer";

interface CustomImageUploadProps {
  onUploadComplete: (url: string) => void;
  onError: (error: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function CustomImageUpload({ onUploadComplete, onError, children, className }: CustomImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onUploadProgress: (p) => {
      setProgress(p);
    },
    onClientUploadComplete: (res) => {
      setProgress(100);
      const url = res?.[0]?.ufsUrl || res?.[0]?.url;
      if (url) {
        onUploadComplete(url);
      }
    },
    onUploadError: (err) => {
      onError(err.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      // Ép nén sang WebP ở client-side
      const optimizedFiles = await Promise.all(files.map(f => optimizeImageToWebp(f)));
      
      // Đẩy mảng file (đã nén) lên UploadThing
      await startUpload(optimizedFiles);
    } catch (err: any) {
      onError(err.message || "Lỗi nén ảnh");
    } finally {
      setIsProcessing(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // reset
      }
    }
  };

  const isLoading = isProcessing || isUploading;

  return (
    <div 
      className={`relative cursor-pointer flex items-center justify-center overflow-hidden ${className || ""}`}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        disabled={isLoading}
      />
      {isLoading ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md gap-1">
           {isProcessing ? (
             <>
               <Loader2 className="h-4 w-4 text-white animate-spin mb-1" />
               <span className="text-[8px] font-bold text-white uppercase tracking-wider">Đang nén...</span>
             </>
           ) : (
             <>
               <span className="text-[10px] font-black text-white">{progress}%</span>
               <div className="w-3/4 h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                 <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
               </div>
             </>
           )}
        </div>
      ) : null}
      <div className={isLoading ? "opacity-30" : "opacity-100"}>
        {children}
      </div>
    </div>
  );
}
