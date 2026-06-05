import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { requestSellerPayout } from "@/lib/runtime/marketplace-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      amount_cents,
      payout_provider = "manual",
    } = body;

    if (!company_id || !amount_cents) {
      return NextResponse.json(
        { error: "company_id and amount_cents are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const result = await requestSellerPayout({
      supabase: service,
      companyId: company_id,
      amountCents: Number(amount_cents),
      payoutProvider: payout_provider,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
