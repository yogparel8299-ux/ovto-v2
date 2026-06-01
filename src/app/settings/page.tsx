"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Settings from "@/components/Settings";
import type { MockFile } from "@/types";
import {
  fetchConnectedApps,
  getWorkspaceContext,
  insertActivity,
  updateIntegrationConnection,
} from "@/lib/supabase/dashboard";
import { fetchAgents } from "@/lib/supabase/agents";
import { fetchFiles } from "@/lib/supabase/files";
import {
  useWorkspaceNavigation,
  WorkspaceEmptyCompany,
  WorkspaceLoading,
} from "@/lib/use-workspace-navigation";

export default function SettingsPage() {
  const router = useRouter();
  const onSetActiveTab = useWorkspaceNavigation();
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [files, setFiles] = useState<MockFile[]>([]);
  const [workers, setWorkers] = useState<Awaited<ReturnType<typeof fetchAgents>>>([]);
  const [activeApps, setActiveApps] = useState<
    { name: string; connected: boolean; desc: string }[]
  >([]);

  const load = useCallback(async () => {
    const ctx = await getWorkspaceContext();
    if (!ctx) {
      router.push("/login");
      return;
    }
    setUserEmail(ctx.email);
    setCompanyId(ctx.companyId);
    if (!ctx.companyId) {
      setLoading(false);
      return;
    }
    const [agentList, fileList, apps] = await Promise.all([
      fetchAgents(ctx.companyId),
      fetchFiles(ctx.companyId),
      fetchConnectedApps(ctx.companyId),
    ]);
    setWorkers(agentList);
    setFiles(fileList);
    setActiveApps(apps);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const onAddActivity = useCallback(
    async (text: string, worker: string) => {
      if (!companyId) return;
      await insertActivity(companyId, text, worker);
    },
    [companyId]
  );

  if (loading) return <WorkspaceLoading />;
  if (!companyId) return <WorkspaceEmptyCompany />;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Settings
        userEmail={userEmail}
        onLogout={() => router.push("/login")}
        workersList={workers}
        companyFiles={files}
        onAddFile={(newFile) => setFiles((prev) => [newFile, ...prev])}
        activeApps={activeApps}
        onToggleApp={async (appName) => {
          if (!companyId) return;
          const current = activeApps.find((a) => a.name === appName);
          const next = !(current?.connected ?? false);
          await updateIntegrationConnection(companyId, appName, next);
          setActiveApps((prev) =>
            prev.map((a) =>
              a.name === appName ? { ...a, connected: next } : a
            )
          );
          await onAddActivity(
            `Connection helper linked with ${appName} was ${next ? "activated" : "deactivated"}.`,
            "System"
          );
        }}
        onSetActiveTab={onSetActiveTab}
        onAddActivity={onAddActivity}
      />
    </main>
  );
}
