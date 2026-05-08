import Header from "@/components/layout/Header";
import { ShieldCheck, Sprout, Wind, ArrowRight, ShoppingBag, Leaf, DatabaseZap } from "lucide-react";
import { db } from "@/db";
import { products } from "@/db/schema";
import Image from "next/image";

export default async function Home() {
  let allProducts: typeof products.$inferSelect[] = [];
  let dbError = false;

  try {
    allProducts = await db.select().from(products);
  } catch (error) {
    console.error("Database connection error on Home page:", error);
    dbError = true;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-50 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-900/20 blur-[120px]" />
      </div>

      <Header />

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="container mx-auto px-6 pt-32 pb-24 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <Sprout className="h-4 w-4" />
            <span>Spring Collection 2026 is here</span>
          </div>
          
          <h1 className="max-w-4xl text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Breathe Life Into Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
              Living Spaces
            </span>
          </h1>
          
          <p className="max-w-xl text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed">
            Premium indoor and outdoor plants delivered safely to your door. Create your personal green sanctuary with TreeSystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="h-14 px-8 rounded-full bg-white text-black font-semibold text-lg flex items-center gap-2 hover:bg-zinc-200 transition-colors">
              Shop Now <ArrowRight className="h-5 w-5" />
            </button>
            <button className="h-14 px-8 rounded-full bg-zinc-900 border border-zinc-800 text-white font-medium text-lg hover:bg-zinc-800 transition-colors">
              View Guide
            </button>
          </div>
        </div>

        {/* Database Products Showcase */}
        <div className="w-full border-t border-white/5 bg-zinc-950/50 pt-20 pb-32">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Leaf className="h-6 w-6 text-emerald-500" /> Featured Plants
              </h2>
              <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-sm flex items-center gap-1">
                View all Catalog <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dbError ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-red-500/5 border border-red-500/20 rounded-2xl">
                  <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                    <DatabaseZap className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">Mất kết nối cơ sở dữ liệu</h3>
                  <p className="text-zinc-400 max-w-lg mx-auto leading-relaxed">
                    Hệ thống không thể tải danh sách sản phẩm do lỗi kết nối Database. <br/>
                    Vui lòng kiểm tra xem service PostgreSQL đã được khởi chạy chưa, hoặc xem lại biến môi trường <code>DATABASE_URL</code> trong file <code>.env</code>.
                  </p>
                </div>
              ) : allProducts.length === 0 ? (
                <div className="col-span-full text-center py-20 text-zinc-500">
                  Shop is currently empty. Visit the Admin Dashboard to add plants.
                </div>
              ) : (
                allProducts.map((p) => (
                  <div key={p.id} className="group flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                    <div className="relative h-64 w-full bg-zinc-800 overflow-hidden">
                      {p.imageUrl ? (
                        <Image 
                          src={p.imageUrl} 
                          alt={p.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                          <Sprout className="h-8 w-8" />
                          <span className="text-sm">No Image</span>
                        </div>
                      )}
                      
                      {/* Price Tag Overlay */}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-emerald-400 font-bold text-sm">
                        ${p.currentPrice}
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                        <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
                          {p.description || "A beautiful addition to your green space."}
                        </p>
                      </div>
                      
                      <button className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-emerald-600 border border-white/5 hover:border-transparent text-white font-medium transition-all text-sm flex items-center justify-center gap-2">
                        <ShoppingBag className="h-4 w-4" /> Add to Cart
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-white/5 w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-zinc-200">14-Day Guarantee</h3>
              <p className="text-sm text-zinc-500 text-center">Your plants arrive healthy or we replace them for free.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Wind className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-zinc-200">Air Purifying</h3>
              <p className="text-sm text-zinc-500 text-center">Enhance your indoor air quality organically.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Sprout className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-zinc-200">Expert Guidance</h3>
              <p className="text-sm text-zinc-500 text-center">Detailed care guides included with every order.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
