"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-stone-950">
      <Navbar
        onStartBuilding={() => router.push("/signup")}
        onLogin={() => router.push("/login")}
        onPricingClick={() => router.push("/pricing")}
        onLogoClick={() => router.push("/")}
      />

      <Hero
        onStartBuilding={() => router.push("/signup")}
        onWatchDemo={() => router.push("/dashboard")}
      />

      <section className="w-full px-6 md:px-12 lg:px-20 py-32 md:py-44 border-t border-stone-950/80">
        <div className="max-w-[1400px] mx-auto text-center relative">
          <p className="text-[10px] font-mono tracking-[0.55em] text-stone-400 uppercase mb-16">
            THE PARADIGM SHIFT
          </p>

          <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.95] text-stone-950">
            One person. Full <br />
            company.
          </h2>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-16 md:absolute md:right-0 md:bottom-10 inline-flex items-center gap-2 rounded-full bg-stone-950 px-7 py-4 text-xs font-bold text-white shadow-xl hover:bg-stone-800"
          >
            <Sparkles className="h-4 w-4 text-[#9D8055]" />
            Instant Dashboard Demo
          </button>
        </div>
      </section>
    </main>
  );
}
