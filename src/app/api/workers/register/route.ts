import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { registerWorker } from "@/lib/runtime/distributed-worker-runtime";

export async function POST(request: Request) {
  const secret = request.headers.get("x-octo-worker-secret");

  if (process.env.OCTO_WORKER_SECRET && secret !== process.env.OCTO_WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const service = getServiceSupabase();

  const worker = await registerWorker({
    supabase: service,
    workerId: body.worker_id,
    workerName: body.worker_name || body.worker_id,
    workerType: body.worker_type || "general",
    metadata: body.metadata || {},
  });

  return NextResponse.json({ worker });
}
