import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { executeComposioTool } from "@/lib/runtime/composio";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      agent_id = null,
      provider,
      action,
      payload = {},
      approval_id = null,
    } = body;

    if (!company_id || !provider || !action) {
      return NextResponse.json(
        { error: "company_id, provider and action are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const result = await executeComposioTool({
      supabase: service,
      input: {
        companyId: company_id,
        agentId: agent_id,
        provider,
        action,
        payload,
        approvalId: approval_id,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
