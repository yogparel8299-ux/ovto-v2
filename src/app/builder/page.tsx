"use client";

import Builder from "@/components/Builder";
import {
  useWorkspaceData,
  WorkspaceEmptyCompany,
  WorkspaceLoading,
} from "@/lib/use-workspace-navigation";

export default function BuilderPage() {
  const {
    loading,
    companyId,
    workers,
    setWorkers,
    files,
    setFiles,
    connectedApps,
    onAddActivity,
  } = useWorkspaceData();

  if (loading) return <WorkspaceLoading />;
  if (!companyId) return <WorkspaceEmptyCompany />;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Builder
        onAddWorkers={(newWorkers) =>
          setWorkers((prev) => [...prev, ...newWorkers])
        }
        onAddActivity={onAddActivity}
        onAddFile={(newFile) => setFiles((prev) => [newFile, ...prev])}
        onToggleApp={() => {}}
        connectedApps={connectedApps}
      />
    </main>
  );
}
