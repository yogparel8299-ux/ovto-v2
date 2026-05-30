"use client";

import Billing from "@/components/Billing";
import { mockAddActivity, mockFiles, mockWorkers } from "@/lib/workspace-mock";
import { useWorkspaceNavigation } from "@/lib/use-workspace-navigation";

export default function BillingPage() {
  const onSetActiveTab = useWorkspaceNavigation();

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Billing
        companyFiles={mockFiles}
        workersList={mockWorkers}
        onSetActiveTab={onSetActiveTab}
        onAddActivity={mockAddActivity}
      />
    </main>
  );
}
