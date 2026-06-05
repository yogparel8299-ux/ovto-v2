import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { syncPaddleSubscription, verifyPaddleSignature } from "@/lib/runtime/paddle-runtime";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("paddle-signature") ||
      request.headers.get("x-paddle-signature");

    const verified = verifyPaddleSignature({
      rawBody,
      signature,
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const service = getServiceSupabase();

    const result = await syncPaddleSubscription({
      supabase: service,
      event,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
