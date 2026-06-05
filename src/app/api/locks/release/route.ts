import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { releaseLock } from "@/lib/runtime/distributed-lock-runtime";

export async function POST(request: Request) {
  const secret = request.headers.get("x-octo-worker-secret");

  if (process.env.OCTO_WORKER_SECRET && secret !== process.env.OCTO_WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const service = getServiceSupabase();

  const result = await releaseLock({
    supabase: service,
    lockKey: body.lock_key,
    workerId: body.worker_id,
  });

  return NextResponse.json(result);
}
