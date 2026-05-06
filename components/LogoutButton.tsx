"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { performClientLogout } from "@/lib/auth-client";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => void performClientLogout()}
      className="rounded-full border-red-500/20 font-medium text-red-500 hover:bg-red-500/10 hover:text-red-400"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Đăng xuất
    </Button>
  );
}
