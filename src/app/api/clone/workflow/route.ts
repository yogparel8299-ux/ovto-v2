import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { cloneWorkflow } from "@/lib/runtime/clone-runtime";

export async function POST(request: Request) {
  const body = await request.json();
  const { company_id, workflow_id } = body;

  if (!company_id || !workflow_id) {
    return NextResponse.json({ error: "company_id and workflow_id are required" }, { status: 400 });
  }

  const { userId, service } = await requireUserAndCompany(request, company_id);
  const clone = await cloneWorkflow({ supabase: service, companyId: company_id, workflowId: workflow_id, createdBy: userId });

  return NextResponse.json({ workflow: clone });
}
