"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Approvals from "@/components/Approvals";
import {
  fetchApprovals,
  updateApprovalStatus,
  type ApprovalRecord,
} from "@/lib/supabase/approvals";
import { getWorkspaceContext, insertActivity } from "@/lib/supabase/dashboard";
import {
  useWorkspaceNavigation,
  WorkspaceEmptyCompany,
  WorkspaceLoading,
} from "@/lib/use-workspace-navigation";

export default function ApprovalsPage() {
  const router = useRouter();
  const onSetActiveTab = useWorkspaceNavigation();
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);

  const load = useCallback(async () => {
    const ctx = await getWorkspaceContext();
    if (!ctx) {
      router.push("/login");
      return;
    }
    setCompanyId(ctx.companyId);
    if (!ctx.companyId) {
      setLoading(false);
      return;
    }
    const rows = await fetchApprovals(ctx.companyId);
    setApprovals(rows);
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

  const onUpdateApproval = useCallback(
    async (id: string, status: "approved" | "rejected") => {
      if (!companyId) return;
      await updateApprovalStatus(companyId, id, status);
      setApprovals((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    },
    [companyId]
  );

  if (loading) return <WorkspaceLoading />;
  if (!companyId) return <WorkspaceEmptyCompany />;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Approvals
        approvals={approvals}
        onAddActivity={onAddActivity}
        onSetActiveTab={onSetActiveTab}
        onUpdateApproval={onUpdateApproval}
      />
    </main>
  );
}
