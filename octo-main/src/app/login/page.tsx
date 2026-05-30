"use client";

import { useRouter } from "next/navigation";
import LoginView from "@/components/LoginView";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <LoginView
        onLoginSuccess={(_email) => router.push("/dashboard")}
        onGoToSignup={() => router.push("/signup")}
      />
    </main>
  );
}
