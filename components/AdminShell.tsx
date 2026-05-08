"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Leaf, Menu, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { adminNavGroups, isAdminNavActive } from "@/lib/admin-nav";
import { performClientLogout } from "@/lib/auth-client";
import { AdminNotificationBell } from "./admin/AdminNotificationBell";
import { useAdminNotification } from "@/lib/stores/admin-notification";

export function AdminShell({
  children,
  username,
  displayName,
}: {
  children: React.ReactNode;
  username: string;
  displayName: string | null | undefined;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { clearNotifications } = useAdminNotification();

  const avatarChar = (displayName || username || "?").charAt(0).toUpperCase();

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const next = e.clientX;
        if (next >= 64 && next <= 480) setSidebarWidth(next);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    setMobileOpen(false);
    clearNotifications();
  }, [pathname, clearNotifications]);

  const isCollapsed = sidebarWidth < 120;

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden bg-background font-sans text-foreground transition-colors duration-200",
        isResizing && "cursor-col-resize"
      )}
    >
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        style={{ 
          width: mobileOpen ? 256 : sidebarWidth,
          flexBasis: mobileOpen ? 256 : sidebarWidth 
        }}
        className={cn(
          "flex h-full shrink-0 flex-col border-sidebar-border bg-sidebar text-sidebar-foreground",
          "z-50 border-r shadow-sm transition-all duration-200",
          "max-md:fixed max-md:inset-y-0 max-md:left-0",
          "md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "max-md:-translate-x-full",
          isResizing && "transition-none"
        )}
      >
        {/* Vùng kéo đủ rộng (≈12px) — chuẩn tiếp cận mục tiêu */}
        <button
          type="button"
          aria-label="Kéo để thay đổi độ rộng sidebar"
          onMouseDown={startResizing}
          className="absolute right-0 top-0 z-[60] h-full w-3 translate-x-1/2 cursor-col-resize border-0 bg-transparent p-0 hover:bg-emerald-500/15"
        />

        <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border/50 px-4">
          <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <Leaf className="h-5 w-5" />
            </div>
            {!isCollapsed ? (
              <span className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                TreeSystem Admin
              </span>
            ) : null}
          </Link>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {adminNavGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!isCollapsed ? (
                <h2 className="mb-1 truncate px-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {group.label}
                </h2>
              ) : null}
              {group.items.map((item) => {
                const active = isAdminNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon
                      className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground/60")}
                      aria-hidden
                    />
                    {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
                    {!isCollapsed && item.label === "Sản phẩm" && (
                       <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--complementary)] shadow-[0_0_8px_var(--complementary)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border/50 bg-sidebar-accent/20 p-4">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sidebar-border/50 bg-card/50 text-[11px] font-bold text-muted-foreground shadow-inner">
              {avatarChar}
            </div>
            {!isCollapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-sidebar-foreground">
                  {displayName || username}
                </p>
                <p className="truncate text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/80">Quản trị viên</p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-accent/50 md:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-primary" />
               <span className="hidden truncate text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 sm:inline">
                Dashboard / {pathname.replace(/^\/admin\/?/, "") || "overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <AdminNotificationBell />
            <ThemeToggle />
            <div className="hidden h-4 w-px bg-border/50 sm:block" />
            <span className="hidden max-w-[120px] truncate text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:inline">
              {username}
            </span>
            <button
              type="button"
              onClick={() => void performClientLogout()}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-background/50 p-3 md:p-8">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
