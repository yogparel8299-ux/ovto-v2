import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { acquireLock } from "@/lib/runtime/distributed-lock-runtime";

export async function POST(request: Request) {
  const secret = request.headers.get("x-octo-worker-secret");

  if (process.env.OCTO_WORKER_SECRET && secret !== process.env.OCTO_WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const service = getServiceSupabase();

  const result = await acquireLock({
    supabase: service,
    companyId: body.company_id || null,
    lockKey: body.lock_key,
    workerId: body.worker_id,
    ttlSeconds: Number(body.ttl_seconds || 60),
    metadata: body.metadata || {},
  });

  return NextResponse.json(result);
}
