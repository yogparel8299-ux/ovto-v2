import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { coordinateSwarms } from "@/lib/runtime/multi-swarm-runtime";

export async function POST(request:Request){

  const body = await request.json();

  const service = getServiceSupabase();

  const result = await coordinateSwarms({
    supabase:service,
    companyId:body.company_id,
    objective:body.objective
  });

  return NextResponse.json(result);
}
