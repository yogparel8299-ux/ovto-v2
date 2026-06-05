import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { snapshotAgentVersion, snapshotWorkflowVersion, snapshotTeamVersion } from "@/lib/runtime/version-runtime";

export async function POST(request: Request) {
  const body = await request.json();
  const { company_id, type, id } = body;

  if (!company_id || !type || !id) {
    return NextResponse.json({ error: "company_id, type and id are required" }, { status: 400 });
  }

  const { userId, service } = await requireUserAndCompany(request, company_id);

  if (type === "agent") {
    const version = await snapshotAgentVersion({ supabase: service, companyId: company_id, agentId: id, createdBy: userId });
    return NextResponse.json({ version });
  }

  if (type === "workflow") {
    const version = await snapshotWorkflowVersion({ supabase: service, companyId: company_id, workflowId: id, createdBy: userId });
    return NextResponse.json({ version });
  }

  if (type === "team") {
    const version = await snapshotTeamVersion({ supabase: service, companyId: company_id, teamId: id, createdBy: userId });
    return NextResponse.json({ version });
  }

  return NextResponse.json({ error: "type must be agent, workflow, or team" }, { status: 400 });
}
