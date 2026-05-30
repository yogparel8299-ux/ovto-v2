"use client";

import { useState } from "react";
import Builder from "@/components/Builder";
import type { AIWorker, MockFile } from "@/types";
import {
  mockAddActivity,
  mockConnectedApps,
  mockFiles,
  mockWorkers,
} from "@/lib/workspace-mock";

export default function BuilderPage() {
  const [workers, setWorkers] = useState<AIWorker[]>(mockWorkers);
  const [files, setFiles] = useState<MockFile[]>(mockFiles);

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Builder
        onAddWorkers={(newWorkers) =>
          setWorkers((prev) => [...prev, ...(newWorkers as AIWorker[])])
        }
        onAddActivity={mockAddActivity}
        onAddFile={(newFile) => setFiles((prev) => [newFile, ...prev])}
        onToggleApp={() => {}}
        connectedApps={mockConnectedApps}
      />
    </main>
  );
}
