"use client";

import { useState } from "react";
import Marketplace from "@/components/Marketplace";
import type { AIWorker, MockFile } from "@/types";
import { mockAddActivity, mockFiles, mockWorkers } from "@/lib/workspace-mock";
import { useWorkspaceNavigation } from "@/lib/use-workspace-navigation";

export default function MarketplacePage() {
  const onSetActiveTab = useWorkspaceNavigation();
  const [workers, setWorkers] = useState<AIWorker[]>(mockWorkers);
  const [files, setFiles] = useState<MockFile[]>(mockFiles);

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Marketplace
        companyFiles={files}
        onSetCompanyFiles={setFiles}
        workersList={workers}
        onSetWorkersList={setWorkers}
        onAddActivity={mockAddActivity}
        onSetActiveTab={onSetActiveTab}
      />
    </main>
  );
}
