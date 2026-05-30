"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

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
