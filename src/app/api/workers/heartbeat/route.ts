import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { markOfflineWorkers, workerHeartbeat } from "@/lib/runtime/distributed-worker-runtime";

export async function POST(request: Request) {
  const secret = request.headers.get("x-octo-worker-secret");

  if (process.env.OCTO_WORKER_SECRET && secret !== process.env.OCTO_WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const service = getServiceSupabase();

  const heartbeat = await workerHeartbeat({
    supabase: service,
    workerId: body.worker_id,
    cpuPercent: Number(body.cpu_percent || 0),
    memoryPercent: Number(body.memory_percent || 0),
    activeJobs: Number(body.active_jobs || 0),
    metadata: body.metadata || {},
  });

  const offline = await markOfflineWorkers({
    supabase: service,
    timeoutSeconds: Number(body.timeout_seconds || 90),
  });

  return NextResponse.json({ heartbeat, offline });
}
