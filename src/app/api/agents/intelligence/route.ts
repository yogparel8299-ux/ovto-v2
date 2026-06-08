import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { calculateAgentPerformance } from "@/lib/runtime/agent-performance-runtime";
import { calculateAgentROI } from "@/lib/runtime/agent-roi-runtime";
import { calculateAgentHealth } from "@/lib/runtime/agent-health-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      agent_id,
    } = body;

    if (!company_id || !agent_id) {
      return NextResponse.json(
        { error: "company_id and agent_id are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const performance = await calculateAgentPerformance({
      supabase: service,
      companyId: company_id,
      agentId: agent_id,
    });

    const roi = await calculateAgentROI({
      supabase: service,
      companyId: company_id,
      agentId: agent_id,
    });

    const health = await calculateAgentHealth({
      supabase: service,
      companyId: company_id,
      agentId: agent_id,
    });

    return NextResponse.json({
      performance,
      roi,
      health,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
