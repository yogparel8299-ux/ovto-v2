"use client";

import Files from "@/components/Files";
import {
  useWorkspaceData,
  useWorkspaceNavigation,
  WorkspaceEmptyCompany,
  WorkspaceLoading,
} from "@/lib/use-workspace-navigation";

export default function FilesPage() {
  const onSetActiveTab = useWorkspaceNavigation();
  const { loading, companyId, workers, files, setFiles, onAddActivity } =
    useWorkspaceData();

  if (loading) return <WorkspaceLoading />;
  if (!companyId) return <WorkspaceEmptyCompany />;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      {files.length === 0 ? (
        <div className="px-14 md:px-20 py-12 border-b border-stone-100">
          <p className="text-xs text-stone-400 font-mono">
            No company files yet. Upload files below to add them to your workspace.
          </p>
        </div>
      ) : null}
      <Files
        companyFiles={files}
        onSetCompanyFiles={setFiles}
        onAddActivity={onAddActivity}
        onSetActiveTab={onSetActiveTab}
        workersList={workers}
      />
    </main>
  );
}
