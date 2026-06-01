"use client";

import Teams from "@/components/Teams";
import {
  useWorkspaceData,
  useWorkspaceNavigation,
  WorkspaceEmptyCompany,
  WorkspaceLoading,
} from "@/lib/use-workspace-navigation";

export default function TeamsPage() {
  const onSetActiveTab = useWorkspaceNavigation();
  const { loading, companyId, workers, files, connectedApps, onAddActivity } =
    useWorkspaceData();

  if (loading) return <WorkspaceLoading />;
  if (!companyId) return <WorkspaceEmptyCompany />;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Teams
        workersList={workers}
        connectedApps={connectedApps}
        companyFiles={files}
        onAddActivity={onAddActivity}
        onSetActiveTab={onSetActiveTab}
      />
    </main>
  );
}
