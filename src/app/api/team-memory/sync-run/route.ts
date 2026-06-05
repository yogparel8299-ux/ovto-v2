import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { syncTeamRunMemory } from "@/lib/runtime/team-memory-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      team_run_id,
    } = body;

    if (!company_id || !team_run_id) {
      return NextResponse.json(
        { error: "company_id and team_run_id are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const result = await syncTeamRunMemory({
      supabase: service,
      companyId: company_id,
      teamRunId: team_run_id,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
