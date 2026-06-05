import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { runAdvancedWorkflow } from "@/lib/runtime/workflow-advanced-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      workflow_id,
      objective,
      input = {},
      trigger_source = "manual",
      trigger_payload = {},
    } = body;

    if (!company_id || !workflow_id || !objective) {
      return NextResponse.json(
        { error: "company_id, workflow_id and objective are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const result = await runAdvancedWorkflow({
      supabase: service,
      companyId: company_id,
      workflowId: workflow_id,
      objective,
      input,
      triggerSource: trigger_source,
      triggerPayload: trigger_payload,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
