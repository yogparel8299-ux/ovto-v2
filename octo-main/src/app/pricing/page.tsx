"use client";

import { useRouter } from "next/navigation";
import Pricing from "@/components/Pricing";

export default function PricingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Pricing
        onStartBuilding={() => router.push("/signup")}
        onLogin={() => router.push("/login")}
      />
    </main>
  );
}
