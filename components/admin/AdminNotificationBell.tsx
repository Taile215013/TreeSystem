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

export function AdminNotificationBell() {
  const { notifications, clearNotifications } = useAdminNotification();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Execute action if provided
    if (notification.action) {
      notification.action.onClick();
    }
    
    // Scroll and highlight element if elementId is provided
    if (notification.elementId) {
      const el = document.getElementById(notification.elementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Add a highlight class temporarily (red/amber depending on type)
        const highlightClass = notification.type === 'error' ? 'ring-red-500' 
                             : notification.type === 'warning' ? 'ring-amber-500' 
                             : 'ring-primary';
                             
        el.classList.add("ring-2", "ring-offset-2", "ring-offset-background", highlightClass, "animate-pulse", "transition-all", "duration-500");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-offset-2", "ring-offset-background", highlightClass, "animate-pulse", "transition-all", "duration-500");
        }, 3000);
      }
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
      <PopoverContent align="end" className="w-80 p-0 shadow-xl border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/10 bg-muted/30 px-4 py-3">
          <h3 className="font-semibold text-sm">Thông báo trang</h3>
          {notifications.length > 0 && (
            <button 
              onClick={() => clearNotifications()}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase font-bold tracking-wider"
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
                    "group flex cursor-pointer gap-3 border-b border-border/5 p-4 transition-all hover:bg-muted/50 last:border-0",
                    getBgColor(notification.type)
                  )}
                >
                  <div className="mt-0.5 shrink-0 drop-shadow-sm">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {notification.title}
                    </p>
                    {notification.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {notification.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[10px] font-medium text-muted-foreground/60">
                        {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      {notification.action && (
                        <span className="text-[10px] font-bold uppercase text-primary">
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
