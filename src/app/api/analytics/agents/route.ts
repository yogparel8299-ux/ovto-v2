import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { getAgentAnalytics } from "@/lib/runtime/analytics-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, agent_id = null } = body;

    if (!company_id) {
      return NextResponse.json({ error: "company_id is required" }, { status: 400 });
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const analytics = await getAgentAnalytics({
      supabase: service,
      companyId: company_id,
      agentId: agent_id || undefined,
    });

    return NextResponse.json({ analytics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
