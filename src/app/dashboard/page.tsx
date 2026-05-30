"use client";

import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { mockUserEmail } from "@/lib/workspace-mock";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <Dashboard
      userEmail={mockUserEmail}
      onLogout={() => router.push("/login")}
    />
  );
}
