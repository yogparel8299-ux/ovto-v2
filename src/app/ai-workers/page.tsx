"use client";

import AIWorkers from "@/components/AIWorkers";
import {
  useWorkspaceData,
  useWorkspaceNavigation,
  WorkspaceEmptyCompany,
  WorkspaceLoading,
} from "@/lib/use-workspace-navigation";

export default function AIWorkersPage() {
  const onSetActiveTab = useWorkspaceNavigation();
  const {
    loading,
    companyId,
    workers,
    setWorkers,
    files,
    connectedApps,
    onAddActivity,
  } = useWorkspaceData();

  if (loading) return <WorkspaceLoading />;
  if (!companyId) return <WorkspaceEmptyCompany />;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <AIWorkers
        onSetActiveTab={onSetActiveTab}
        workersList={workers}
        onAddWorkers={(newWorkers) =>
          setWorkers((prev) => [...prev, ...newWorkers])
        }
        onAddActivity={onAddActivity}
        connectedApps={connectedApps}
        companyFiles={files}
      />
    </main>
  );
}
