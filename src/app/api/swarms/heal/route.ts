import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { healSwarm } from "@/lib/runtime/self-healing-runtime";

export async function POST(request:Request){

  const body = await request.json();

  const service = getServiceSupabase();

  const result = await healSwarm({
    supabase:service,
    companyId:body.company_id
  });

  return NextResponse.json(result);
}
