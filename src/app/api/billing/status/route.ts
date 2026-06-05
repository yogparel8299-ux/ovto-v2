import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { getSubscriptionStatus } from "@/lib/runtime/paddle-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id } = body;

    if (!company_id) {
      return NextResponse.json({ error: "company_id is required" }, { status: 400 });
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const result = await getSubscriptionStatus({
      supabase: service,
      companyId: company_id,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 401 }
    );
  }
}
