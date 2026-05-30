"use client";

import { useState } from "react";
import Files from "@/components/Files";
import type { MockFile } from "@/types";
import { mockAddActivity, mockFiles, mockWorkers } from "@/lib/workspace-mock";
import { useWorkspaceNavigation } from "@/lib/use-workspace-navigation";

export default function FilesPage() {
  const onSetActiveTab = useWorkspaceNavigation();
  const [files, setFiles] = useState<MockFile[]>(mockFiles);

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Files
        companyFiles={files}
        onSetCompanyFiles={setFiles}
        onAddActivity={mockAddActivity}
        onSetActiveTab={onSetActiveTab}
        workersList={mockWorkers}
      />
    </main>
  );
}
