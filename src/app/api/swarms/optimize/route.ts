import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { optimizeSwarm } from "@/lib/runtime/dynamic-swarm-runtime";

export async function POST(request:Request){

  const body = await request.json();

  const service = getServiceSupabase();

  const result = await optimizeSwarm({
    supabase:service,
    companyId:body.company_id,
    teamId:body.team_id
  });

  return NextResponse.json(result);
}
