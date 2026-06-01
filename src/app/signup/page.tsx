"use client";

import { useRouter } from "next/navigation";
import SignupView from "@/components/SignupView";

export default function SignupPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <SignupView
        onSignupSuccess={(_email) => router.push("/dashboard")}
        onGoToLogin={() => router.push("/login")}
      />
    </main>
  );
}
