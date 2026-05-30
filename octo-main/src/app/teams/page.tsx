"use client";

import Teams from "@/components/Teams";
import {
  mockAddActivity,
  mockConnectedApps,
  mockFiles,
  mockWorkers,
} from "@/lib/workspace-mock";
import { useWorkspaceNavigation } from "@/lib/use-workspace-navigation";

export default function TeamsPage() {
  const onSetActiveTab = useWorkspaceNavigation();

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Teams
        workersList={mockWorkers}
        connectedApps={mockConnectedApps}
        companyFiles={mockFiles}
        onAddActivity={mockAddActivity}
        onSetActiveTab={onSetActiveTab}
      />
    </main>
  );
}
