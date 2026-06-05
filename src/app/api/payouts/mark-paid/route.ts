import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { markSellerPayoutPaid } from "@/lib/runtime/marketplace-runtime";

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-octo-worker-secret");

    if (
      process.env.OCTO_WORKER_SECRET &&
      secret !== process.env.OCTO_WORKER_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      company_id,
      payout_id,
      payout_reference,
    } = body;

    if (!company_id || !payout_id || !payout_reference) {
      return NextResponse.json(
        { error: "company_id, payout_id and payout_reference are required" },
        { status: 400 }
      );
    }

    const service = getServiceSupabase();

    const result = await markSellerPayoutPaid({
      supabase: service,
      companyId: company_id,
      payoutId: payout_id,
      payoutReference: payout_reference,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
