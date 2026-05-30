"use client";

import Workflows from "@/components/Workflows";
import {
  mockAddActivity,
  mockConnectedApps,
  mockFiles,
  mockWorkers,
} from "@/lib/workspace-mock";
import { useWorkspaceNavigation } from "@/lib/use-workspace-navigation";

export default function WorkflowsPage() {
  const onSetActiveTab = useWorkspaceNavigation();

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Workflows
        workersList={mockWorkers}
        connectedApps={mockConnectedApps}
        companyFiles={mockFiles}
        onAddActivity={mockAddActivity}
        onSetActiveTab={onSetActiveTab}
      />
    </main>
  );
}
