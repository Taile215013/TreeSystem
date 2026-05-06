"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyRound, Loader2, User } from "lucide-react";

export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (action: "login" | "register", e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const endpoint = action === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setMessage({ text: data.message || `Successfully ${action === "login" ? "logged in" : "registered"}!`, type: "success" });
      
      if (action === "login") {
        setTimeout(() => {
          setIsOpen(false);
          // Redirect or refresh to hydrate Server component Auth Session
          window.location.href = "/account";
        }, 1000);
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:shadow-[0_0_25px_rgba(16,185,129,0.7)]"
        >
          <User className="mr-2 h-4 w-4" />
          Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center tracking-tight text-white mb-2">Welcome Back</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Access your treesystem portfolio and manage your orders.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 rounded-xl p-1 mb-6">
            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Sign In</TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={(e) => handleAuth("login", e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-zinc-300 ml-1">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="login-username" 
                    placeholder="Enter your username" 
                    className="pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-emerald-500 text-white h-11 rounded-xl"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="login-password" className="text-zinc-300">Password</Label>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="login-password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-emerald-500 text-white h-11 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-md font-medium transition-all" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={(e) => handleAuth("register", e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-username" className="text-zinc-300 ml-1">Choose Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="reg-username" 
                    placeholder="e.g. tree_lover99" 
                    className="pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-emerald-500 text-white h-11 rounded-xl"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-zinc-300 ml-1">Create Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="reg-password" 
                    type="password" 
                    placeholder="Minimum 6 characters" 
                    className="pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-emerald-500 text-white h-11 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl border border-emerald-600/50 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-500 text-md font-medium transition-all" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {message.text}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
