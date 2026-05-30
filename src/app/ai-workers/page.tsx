"use client";

import { useState } from "react";
import AIWorkers from "@/components/AIWorkers";
import type { AIWorker, MockFile } from "@/types";
import {
  mockAddActivity,
  mockConnectedApps,
  mockFiles,
  mockWorkers,
} from "@/lib/workspace-mock";
import { useWorkspaceNavigation } from "@/lib/use-workspace-navigation";

export default function AIWorkersPage() {
  const onSetActiveTab = useWorkspaceNavigation();
  const [workers, setWorkers] = useState<AIWorker[]>(mockWorkers);
  const [files, setFiles] = useState<MockFile[]>(mockFiles);

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <AIWorkers
        onSetActiveTab={onSetActiveTab}
        workersList={workers}
        onAddWorkers={(newWorkers) =>
          setWorkers((prev) => [...prev, ...(newWorkers as AIWorker[])])
        }
        onAddActivity={mockAddActivity}
        connectedApps={mockConnectedApps}
        companyFiles={files}
        onAddFile={(newFile) => setFiles((prev) => [newFile as MockFile, ...prev])}
      />
    </main>
  );
}
