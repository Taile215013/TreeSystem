import { getUserSession } from "@/lib/session";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, Link as LinkIcon, Edit3 } from "lucide-react";
import Image from "next/image";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/AuthForm";

export default async function AccountPage() {
  const user = await getUserSession();

  // If not logged in, render the Login/Register form directly on the page
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-zinc-50 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
        <div className="fixed inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-900/20 blur-[120px]" />
        </div>
        <Header />
        <div className="relative z-10 px-4">
          <AuthForm />
        </div>
      </div>
    );
  }

  // Format join date
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  // Use placehoder if no cover/avatar
  const coverImg = user.coverUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2626&auto=format&fit=crop";
  const avatarImg = user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=059669`;

  return (
    <div className="min-h-screen bg-black text-zinc-50 font-sans selection:bg-emerald-500/30">
      <Header />

      <main className="max-w-4xl mx-auto border-x border-white/5 min-h-[calc(100vh-80px)] bg-black/50">

        {/* Profile Header Block */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 md:h-64 w-full relative bg-zinc-900 group overflow-hidden">
            <Image
              src={coverImg}
              alt="Cover Photo"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          /* Profile info block */
          <div className="px-6 pb-6 w-full relative">
            <div className="flex justify-between items-start">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4 w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-zinc-800 shadow-2xl z-10">
                <Image
                  src={avatarImg}
                  alt={user.displayName || user.username || "User Avatar"}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-3">
                <Button variant="outline" className="rounded-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <LogoutButton />
              </div>
            </div>

            {/* Names & Bio */}
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {user.displayName || "Nature Enthusiast"}
              </h1>
              <p className="text-zinc-500 font-medium tracking-wide">@{user.username || "user"}</p>
            </div>

            <div className="mt-4 max-w-2xl text-zinc-300 leading-relaxed text-[15px]">
              {user.bio || "Passionate about building green spaces indoors. Collector of rare Monstera and Philodendron varieties. Welcome to my TreeSystem portfolio! 🌱"}
            </div>

            {/* Meta tags */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors cursor-pointer">
                <MapPin className="h-4 w-4" />
                Silicon Valley, CA
              </div>
              <div className="flex items-center gap-1.5 hover:emerald-400 transition-colors cursor-pointer text-emerald-500">
                <LinkIcon className="h-4 w-4" />
                <a href="#" className="hover:underline">treesystem.com</a>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Joined {joinDate}
              </div>
            </div>

            {/* Following/Followers stats */}
            <div className="mt-5 flex items-center gap-6 text-sm">
              <div className="cursor-pointer hover:underline">
                <span className="font-bold text-white">124</span> <span className="text-zinc-500">Following</span>
              </div>
              <div className="cursor-pointer hover:underline">
                <span className="font-bold text-white">1,092</span> <span className="text-zinc-500">Followers</span>
              </div>
              <div className="cursor-pointer hover:underline">
                <span className="font-bold text-white">42</span> <span className="text-zinc-500">Trees Ordered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Tabs */}
        <Tabs defaultValue="collection" className="w-full mt-2">
          <TabsList className="w-full justify-start border-b border-white/5 bg-transparent rounded-none p-0 h-14">
            <TabsTrigger
              value="collection"
              className="px-8 h-14 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-white font-medium text-zinc-400 data-[state=active]:shadow-none"
            >
              Collection
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="px-8 h-14 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-white font-medium text-zinc-400 data-[state=active]:shadow-none"
            >
              Order History
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="px-8 h-14 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-white font-medium text-zinc-400 data-[state=active]:shadow-none"
            >
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="p-6">
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-white mb-2">No plants in collection yet</h3>
              <p className="text-zinc-500">Start exploring our catalog to build your green sanctuary.</p>
              <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700 rounded-full px-8">Find Trees</Button>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="p-6 text-zinc-400">
            Order history will appear here.
          </TabsContent>

          <TabsContent value="likes" className="p-6 text-zinc-400">
            Trees you've liked will appear here.
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
