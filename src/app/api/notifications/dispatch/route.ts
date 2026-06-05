import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { dispatchNotifications } from "@/lib/runtime/notification-dispatch-runtime";

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

    const result = await dispatchNotifications({
      supabase: service,
      limit: Number(body.limit || 25),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
