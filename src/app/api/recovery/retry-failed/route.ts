import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { markStuckRunsFailed, retryFailedAgentRuns } from "@/lib/runtime/recovery-runtime";

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-octo-worker-secret");

    if (
      process.env.OCTO_WORKER_SECRET &&
      secret !== process.env.OCTO_WORKER_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const service = getServiceSupabase();

    const stuck = await markStuckRunsFailed({
      supabase: service,
      minutes: Number(body.timeout_minutes || 30),
    });

    const retried = await retryFailedAgentRuns({
      supabase: service,
      limit: Number(body.limit || 25),
    });

    return NextResponse.json({
      stuck,
      retried,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
