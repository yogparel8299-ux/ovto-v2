import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { getQueueHealth, queueScalingRecommendation } from "@/lib/runtime/worker-monitor-runtime";

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

    const health = await getQueueHealth({
      supabase: service,
      companyId: body.company_id || undefined,
    });

    const scaling = await queueScalingRecommendation({
      supabase: service,
    });

    return NextResponse.json({
      health,
      scaling,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
