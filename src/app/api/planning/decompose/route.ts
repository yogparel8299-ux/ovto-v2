import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { decomposeGoal } from "@/lib/runtime/planning-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, planner_agent_id, goal } = body;

    if (!company_id || !planner_agent_id || !goal) {
      return NextResponse.json(
        { error: "company_id, planner_agent_id and goal are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const plan = await decomposeGoal({
      supabase: service,
      companyId: company_id,
      plannerAgentId: planner_agent_id,
      goal,
    });

    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
