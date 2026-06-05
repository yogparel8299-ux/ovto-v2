import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { rollbackTeam } from "@/lib/runtime/rollback-runtime";

export async function POST(request: Request) {
  const body = await request.json();

  const {
    company_id,
    team_id,
    version,
  } = body;

  const { service } =
    await requireUserAndCompany(request, company_id);

  const result = await rollbackTeam({
    supabase: service,
    companyId: company_id,
    teamId: team_id,
    version: Number(version),
  });

  return NextResponse.json(result);
}
