import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { delegatePlanToAgents, executePlanTasks } from "@/lib/runtime/planning-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      planner_agent_id,
      goal = null,
      task_ids = [],
      mode = "delegate",
    } = body;

    if (!company_id || !planner_agent_id) {
      return NextResponse.json(
        { error: "company_id and planner_agent_id are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    if (goal && mode === "delegate") {
      const result = await delegatePlanToAgents({
        supabase: service,
        companyId: company_id,
        plannerAgentId: planner_agent_id,
        goal,
      });

      return NextResponse.json(result);
    }

    const result = await executePlanTasks({
      supabase: service,
      companyId: company_id,
      plannerAgentId: planner_agent_id,
      taskIds: task_ids,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
