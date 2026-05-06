"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300",
        isDark 
          ? "bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800" 
          : "bg-white border-zinc-200 text-amber-600 hover:bg-zinc-50 shadow-sm"
      )}
    >
      <Sun className={cn(
        "h-4 w-4 absolute transition-all duration-500",
        isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
      )} />
      <Moon className={cn(
        "h-4 w-4 absolute transition-all duration-500",
        isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
      )} />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
