"use client";

import Approvals from "@/components/Approvals";
import { mockAddActivity } from "@/lib/workspace-mock";
import { useWorkspaceNavigation } from "@/lib/use-workspace-navigation";

export default function ApprovalsPage() {
  const onSetActiveTab = useWorkspaceNavigation();

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Approvals onAddActivity={mockAddActivity} onSetActiveTab={onSetActiveTab} />
    </main>
  );
}
