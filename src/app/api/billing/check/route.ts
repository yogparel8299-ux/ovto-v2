import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { ensureCompanyCanRun } from "@/lib/runtime/billing-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, estimated_cost_cents = 1 } = body;

    if (!company_id) {
      return NextResponse.json({ error: "company_id is required" }, { status: 400 });
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const result = await ensureCompanyCanRun({
      supabase: service,
      companyId: company_id,
      estimatedCostCents: Number(estimated_cost_cents),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 401 }
    );
  }
}
