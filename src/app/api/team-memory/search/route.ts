import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { searchTeamMemory } from "@/lib/runtime/team-memory-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      team_id,
      query,
      limit = 10,
    } = body;

    if (!company_id || !team_id || !query) {
      return NextResponse.json(
        { error: "company_id, team_id and query are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const memories = await searchTeamMemory({
      supabase: service,
      companyId: company_id,
      teamId: team_id,
      query,
      limit: Number(limit),
    });

    return NextResponse.json({ memories });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
