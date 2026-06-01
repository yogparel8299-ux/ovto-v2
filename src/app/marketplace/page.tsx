"use client";

import Marketplace from "@/components/Marketplace";
import {
  useWorkspaceData,
  useWorkspaceNavigation,
  WorkspaceEmptyCompany,
  WorkspaceLoading,
} from "@/lib/use-workspace-navigation";

export default function MarketplacePage() {
  const onSetActiveTab = useWorkspaceNavigation();
  const {
    loading,
    companyId,
    workers,
    setWorkers,
    files,
    setFiles,
    onAddActivity,
  } = useWorkspaceData();

  if (loading) return <WorkspaceLoading />;
  if (!companyId) return <WorkspaceEmptyCompany />;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Marketplace
        companyFiles={files}
        onSetCompanyFiles={setFiles}
        workersList={workers}
        onSetWorkersList={setWorkers}
        onAddActivity={onAddActivity}
        onSetActiveTab={onSetActiveTab}
      />
    </main>
  );
}
