"use client";

import { useState } from "react";
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAdminNotification } from "@/lib/stores/admin-notification";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AdminNotificationBell() {
  const { notifications, clearNotifications } = useAdminNotification();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Execute action if provided
    if (notification.action) {
      notification.action.onClick();
    }
    
    // Combine elementId and elementIds for processing
    const idsToHighlight = [];
    if (notification.elementId) idsToHighlight.push(notification.elementId);
    if (notification.elementIds && notification.elementIds.length > 0) {
      idsToHighlight.push(...notification.elementIds);
    }

    if (idsToHighlight.length > 0) {
      // Scroll to the first element
      const firstEl = document.getElementById(idsToHighlight[0]);
      if (firstEl) {
        firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Highlight all elements
      const highlightClass = notification.type === 'error' ? 'ring-red-500' 
                           : notification.type === 'warning' ? 'ring-amber-500' 
                           : 'ring-primary';

      idsToHighlight.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add("ring-2", "ring-offset-2", "ring-offset-background", highlightClass, "animate-pulse", "transition-all", "duration-500");
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-offset-2", "ring-offset-background", highlightClass, "animate-pulse", "transition-all", "duration-500");
          }, 3000);
        }
      });
    }

    setOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "muted": return <Info className="h-5 w-5 text-zinc-400" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "error": return "bg-red-500/5 border-red-500/10";
      case "warning": return "bg-amber-500/5 border-amber-500/10";
      case "success": return "bg-emerald-500/5 border-emerald-500/10";
      case "muted": return "bg-zinc-500/5 border-zinc-500/10";
      default: return "bg-blue-500/5 border-blue-500/10";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent/50 active:scale-95"
          aria-label="Thông báo"
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        sideOffset={8}
        className="w-[360px] p-0 shadow-2xl border-border/40 bg-background/80 backdrop-blur-3xl rounded-2xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-4"
      >
        <div className="flex items-center justify-between border-b border-border/10 bg-gradient-to-r from-muted/50 to-muted/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Thông báo
            </h3>
            
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="h-5 w-5 rounded-full flex items-center justify-center bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-64 p-3 bg-zinc-900 border-zinc-800 text-zinc-300 shadow-2xl z-[100]">
                  <p className="text-xs font-bold text-white mb-2">Phân loại lỗi</p>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> <span><b className="text-red-400">Đỏ:</b> Lỗi nghiêm trọng (Thiếu dữ liệu bắt buộc)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> <span><b className="text-amber-400">Vàng:</b> Cảnh báo (Thiếu ảnh, sắp hết hàng)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> <span><b className="text-blue-400">Xanh dương:</b> Thông tin mới (Đơn hàng, tin nhắn)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span><b className="text-emerald-400">Xanh lá:</b> Thành công</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zinc-500" /> <span><b className="text-zinc-400">Xám:</b> Thông báo phụ</span></div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
          {notifications.length > 0 && (
            <button 
              onClick={() => clearNotifications()}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase font-bold tracking-widest bg-muted/30 px-2 py-1 rounded-md"
            >
              Xóa tất cả
            </button>
          )}
        </div>
        <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-3 opacity-20" />
              Không có thông báo nào trên trang này.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "group flex cursor-pointer gap-3 border-b border-border/5 p-4 transition-all duration-300 hover:bg-muted/80 last:border-0 relative overflow-hidden",
                    getBgColor(notification.type)
                  )}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity" 
                       style={{ backgroundColor: notification.type === 'error' ? '#ef4444' : notification.type === 'warning' ? '#f59e0b' : '#3b82f6' }} 
                  />
                  
                  <div className="mt-0.5 shrink-0 drop-shadow-sm transition-transform group-hover:scale-110 duration-300">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold leading-tight text-foreground/90 group-hover:text-foreground transition-colors">
                      {notification.title}
                    </p>
                    {notification.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {notification.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                        {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notification.action && (
                        <span className="text-[9px] font-bold uppercase text-primary/80 group-hover:text-primary transition-colors">
                          • {notification.action.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
