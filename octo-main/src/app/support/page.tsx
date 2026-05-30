"use client";

import { useRouter } from "next/navigation";
import Support from "@/components/Support";

export default function SupportPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Support
        onGoToLogin={() => router.push("/login")}
        onGoToDashboard={() => router.push("/dashboard")}
      />
    </main>
  );
}
