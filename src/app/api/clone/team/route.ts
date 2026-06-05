import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { cloneTeam } from "@/lib/runtime/clone-runtime";

export async function POST(request: Request) {
  const body = await request.json();
  const { company_id, team_id } = body;

  if (!company_id || !team_id) {
    return NextResponse.json({ error: "company_id and team_id are required" }, { status: 400 });
  }

  const { userId, service } = await requireUserAndCompany(request, company_id);
  const clone = await cloneTeam({ supabase: service, companyId: company_id, teamId: team_id, createdBy: userId });

  return NextResponse.json({ team: clone });
}
