"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AIWorker, MockFile } from "@/types";
import { fetchAgents, fetchConnectedAppNames } from "@/lib/supabase/agents";
import { fetchFiles } from "@/lib/supabase/files";
import {
  getWorkspaceContext,
  insertActivity,
} from "@/lib/supabase/dashboard";

export type WorkspaceTab =
  | "dashboard"
  | "builder"
  | "workers"
  | "workflows"
  | "teams"
  | "files"
  | "marketplace"
  | "billing"
  | "settings"
  | "approvals";

const TAB_ROUTES: Record<WorkspaceTab, string> = {
  dashboard: "/dashboard",
  builder: "/builder",
  workers: "/ai-workers",
  workflows: "/workflows",
  teams: "/teams",
  files: "/files",
  marketplace: "/marketplace",
  billing: "/billing",
  settings: "/settings",
  approvals: "/approvals",
};

export function useWorkspaceNavigation() {
  const router = useRouter();

  return useCallback(
    (tab: WorkspaceTab | string) => {
      const path = TAB_ROUTES[tab as WorkspaceTab];
      if (path) {
        router.push(path);
      }
    },
    [router],
  );
}

export function useWorkspaceData() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [workers, setWorkers] = useState<AIWorker[]>([]);
  const [files, setFiles] = useState<MockFile[]>([]);
  const [connectedApps, setConnectedApps] = useState<string[]>([]);

  const reload = useCallback(async () => {
    const ctx = await getWorkspaceContext();
    if (!ctx) {
      router.push("/login");
      return null;
    }
    setUserEmail(ctx.email);
    setCompanyId(ctx.companyId);
    if (!ctx.companyId) {
      return ctx;
    }
    const [agentList, fileList, apps] = await Promise.all([
      fetchAgents(ctx.companyId),
      fetchFiles(ctx.companyId),
      fetchConnectedAppNames(ctx.companyId),
    ]);
    setWorkers(agentList);
    setFiles(fileList);
    setConnectedApps(apps);
    return ctx;
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await reload();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const onAddActivity = useCallback(
    async (text: string, worker: string) => {
      if (!companyId) return;
      await insertActivity(companyId, text, worker);
    },
    [companyId]
  );

  return {
    loading,
    companyId,
    userEmail,
    workers,
    setWorkers,
    files,
    setFiles,
    connectedApps,
    onAddActivity,
    reload,
  };
}

export function WorkspaceLoading() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
      <p className="text-xs font-mono text-stone-400 animate-pulse">
        Loading workspace...
      </p>
    </main>
  );
}

export function WorkspaceEmptyCompany() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center px-6">
      <div className="text-center max-w-md space-y-3">
        <p className="text-sm font-semibold text-stone-950">No company workspace</p>
        <p className="text-xs text-stone-400 leading-relaxed">
          Your account does not have a default company yet. Set a default company in
          your profile to load workspace data.
        </p>
      </div>
    </main>
  );
}
