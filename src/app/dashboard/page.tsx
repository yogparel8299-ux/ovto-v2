"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { fetchAgents } from "@/lib/supabase/agents";
import { fetchFiles } from "@/lib/supabase/files";
import {
  clearNotifications,
  fetchConnectedApps,
  fetchDashboardApprovals,
  fetchDashboardMetrics,
  fetchNotifications,
  fetchRecentActivity,
  fetchUserCompanies,
  getWorkspaceContext,
  insertActivity,
  resolveApproval,
  updateIntegrationConnection,
  type DashboardInitialData,
} from "@/lib/supabase/dashboard";
import {
  WorkspaceEmptyCompany,
  WorkspaceLoading,
} from "@/lib/use-workspace-navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [initialData, setInitialData] = useState<DashboardInitialData | null>(
    null
  );

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

    const [
      metrics,
      activities,
      approvals,
      notifications,
      companies,
      apps,
      workers,
      files,
    ] = await Promise.all([
      fetchDashboardMetrics(ctx.companyId),
      fetchRecentActivity(ctx.companyId),
      fetchDashboardApprovals(ctx.companyId),
      fetchNotifications(ctx.companyId),
      fetchUserCompanies(ctx.userId),
      fetchConnectedApps(ctx.companyId),
      fetchAgents(ctx.companyId),
      fetchFiles(ctx.companyId),
    ]);

    setInitialData({
      metrics,
      activities,
      approvals,
      notifications,
      companies,
      apps,
      workers,
      files,
    });
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const onAddActivity = useCallback(
    async (text: string, worker: string) => {
      if (!companyId) return;
      await insertActivity(companyId, text, worker);
      const activities = await fetchRecentActivity(companyId);
      setInitialData((prev) => (prev ? { ...prev, activities } : prev));
    },
    [companyId]
  );

  const onClearNotifications = useCallback(async () => {
    if (!companyId) return;
    await clearNotifications(companyId);
    setInitialData((prev) => (prev ? { ...prev, notifications: [] } : prev));
  }, [companyId]);

  const onResolveApproval = useCallback(
    async (
      approvalId: string,
      status: "approved" | "rejected",
      title: string,
      worker: string
    ) => {
      if (!companyId) return;
      await resolveApproval(companyId, approvalId, status);
      await insertActivity(
        companyId,
        `${status === "approved" ? "Approved" : "Skipped"} action: ${title}.`,
        worker
      );
      const [approvals, activities] = await Promise.all([
        fetchDashboardApprovals(companyId),
        fetchRecentActivity(companyId),
      ]);
      setInitialData((prev) =>
        prev ? { ...prev, approvals, activities } : prev
      );
    },
    [companyId]
  );

  const onToggleApp = useCallback(
    async (appName: string, connected: boolean) => {
      if (!companyId) return;
      await updateIntegrationConnection(companyId, appName, connected);
      const apps = await fetchConnectedApps(companyId);
      setInitialData((prev) => (prev ? { ...prev, apps } : prev));
      await onAddActivity(
        `Connection helper linked with ${appName} was ${connected ? "activated" : "deactivated"}.`,
        "System"
      );
    },
    [companyId, onAddActivity]
  );

  if (loading) return <WorkspaceLoading />;
  if (!companyId || !initialData) return <WorkspaceEmptyCompany />;

  return (
    <Dashboard
      userEmail={userEmail}
      onLogout={() => router.push("/login")}
      companyId={companyId}
      initialData={initialData}
      onAddActivity={onAddActivity}
      onClearNotifications={onClearNotifications}
      onResolveApproval={onResolveApproval}
      onToggleApp={onToggleApp}
      onRefresh={load}
    />
  );
}
