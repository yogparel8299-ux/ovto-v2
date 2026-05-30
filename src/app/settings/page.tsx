"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Settings from "@/components/Settings";
import type { MockFile } from "@/types";
import {
  mockAddActivity,
  mockApps,
  mockFiles,
  mockUserEmail,
  mockWorkers,
} from "@/lib/workspace-mock";
import { useWorkspaceNavigation } from "@/lib/use-workspace-navigation";

export default function SettingsPage() {
  const router = useRouter();
  const onSetActiveTab = useWorkspaceNavigation();
  const [files, setFiles] = useState<MockFile[]>(mockFiles);

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Settings
        userEmail={mockUserEmail}
        onLogout={() => router.push("/login")}
        workersList={mockWorkers}
        companyFiles={files}
        onAddFile={(newFile) => setFiles((prev) => [newFile, ...prev])}
        activeApps={mockApps}
        onToggleApp={() => {}}
        onSetActiveTab={onSetActiveTab}
        onAddActivity={mockAddActivity}
      />
    </main>
  );
}
