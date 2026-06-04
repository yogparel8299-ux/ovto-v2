import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { runSwarm } from "@/lib/runtime/swarm-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      team_id,
      objective,
      trigger_source = "manual",
    } = body;

    if (!company_id || !team_id || !objective) {
      return NextResponse.json(
        { error: "company_id, team_id and objective are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const result = await runSwarm({
      supabase: service,
      companyId: company_id,
      teamId: team_id,
      objective,
      triggerSource: trigger_source,
    });

    return NextResponse.json({
      message: "Swarm run started",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
