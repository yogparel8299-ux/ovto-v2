import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { cloneAgent } from "@/lib/runtime/clone-runtime";

export async function POST(request: Request) {
  const body = await request.json();
  const { company_id, agent_id } = body;

  if (!company_id || !agent_id) {
    return NextResponse.json({ error: "company_id and agent_id are required" }, { status: 400 });
  }

  const { userId, service } = await requireUserAndCompany(request, company_id);
  const clone = await cloneAgent({ supabase: service, companyId: company_id, agentId: agent_id, createdBy: userId });

  return NextResponse.json({ agent: clone });
}
