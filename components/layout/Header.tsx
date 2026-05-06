import Link from "next/link";
import { Leaf } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { getUserSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function Header() {
  const user = await getUserSession();

  return (
    <header className="relative z-10 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
            TreeSystem
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/Categories" className="hover:text-emerald-400 transition-colors">Danh Mục</Link>
          <Link href="#" className="hover:text-emerald-400 transition-colors">Collections</Link>
          <Link href="#" className="hover:text-emerald-400 transition-colors">Catalog</Link>
          <Link href="#" className="hover:text-emerald-400 transition-colors">About Us</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/account">
              <Button variant="outline" className="rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 flex items-center gap-2 h-10 px-4 transition-all">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="Avatar" width={24} height={24} className="rounded-full object-cover" />
                ) : (
                  <div className="h-6 w-6 bg-emerald-600 rounded-full flex items-center justify-center text-xs text-white">
                    {(user.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span>Profile</span>
              </Button>
            </Link>
          ) : (
            <Link href="/account">
              <Button 
                variant="default" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:shadow-[0_0_25px_rgba(16,185,129,0.7)]"
              >
                Account
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
