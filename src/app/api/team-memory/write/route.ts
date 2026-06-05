import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { writeTeamMemory } from "@/lib/runtime/team-memory-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      team_id,
      title,
      content,
      importance = 5,
      metadata = {},
      created_by_run_id = null,
    } = body;

    if (!company_id || !team_id || !title || !content) {
      return NextResponse.json(
        { error: "company_id, team_id, title and content are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const memory = await writeTeamMemory({
      supabase: service,
      companyId: company_id,
      teamId: team_id,
      title,
      content,
      importance: Number(importance),
      metadata,
      createdByRunId: created_by_run_id,
    });

    return NextResponse.json({ memory });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
