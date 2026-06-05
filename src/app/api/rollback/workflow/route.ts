import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { rollbackWorkflow } from "@/lib/runtime/rollback-runtime";

export async function POST(request: Request) {
  const body = await request.json();

  const {
    company_id,
    workflow_id,
    version,
    reason,
  } = body;

  const { service, userId } =
    await requireUserAndCompany(request, company_id);

  const result = await rollbackWorkflow({
    supabase: service,
    companyId: company_id,
    workflowId: workflow_id,
    version: Number(version),
    rolledBackBy: userId,
    reason,
  });

  return NextResponse.json(result);
}
