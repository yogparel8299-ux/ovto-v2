"use client";

import Billing from "@/components/Billing";
import {
  useWorkspaceData,
  useWorkspaceNavigation,
  WorkspaceEmptyCompany,
  WorkspaceLoading,
} from "@/lib/use-workspace-navigation";

export default function BillingPage() {
  const onSetActiveTab = useWorkspaceNavigation();
  const { loading, companyId, workers, files, onAddActivity } =
    useWorkspaceData();

  if (loading) return <WorkspaceLoading />;
  if (!companyId) return <WorkspaceEmptyCompany />;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Billing
        companyFiles={files}
        workersList={workers}
        onSetActiveTab={onSetActiveTab}
        onAddActivity={onAddActivity}
      />
    </main>
  );
}
