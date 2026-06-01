"use client";

import Workflows from "@/components/Workflows";
import {
  useWorkspaceData,
  useWorkspaceNavigation,
  WorkspaceEmptyCompany,
  WorkspaceLoading,
} from "@/lib/use-workspace-navigation";

export default function WorkflowsPage() {
  const onSetActiveTab = useWorkspaceNavigation();
  const { loading, companyId, workers, files, connectedApps, onAddActivity } =
    useWorkspaceData();

  if (loading) return <WorkspaceLoading />;
  if (!companyId) return <WorkspaceEmptyCompany />;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Workflows
        workersList={workers}
        connectedApps={connectedApps}
        companyFiles={files}
        onAddActivity={onAddActivity}
        onSetActiveTab={onSetActiveTab}
      />
    </main>
  );
}
