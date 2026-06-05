import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { rollbackAgent } from "@/lib/runtime/rollback-runtime";

export async function POST(request: Request) {
  const body = await request.json();

  const {
    company_id,
    agent_id,
    version,
  } = body;

  const { service } =
    await requireUserAndCompany(request, company_id);

  const result = await rollbackAgent({
    supabase: service,
    companyId: company_id,
    agentId: agent_id,
    version: Number(version),
  });

  return NextResponse.json(result);
}
