import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { searchCompanyMemory } from "@/lib/runtime/memory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, query, limit = 8 } = body;

    if (!company_id || !query) {
      return NextResponse.json(
        { error: "company_id and query are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const memories = await searchCompanyMemory({
      supabase: service,
      companyId: company_id,
      query,
      limit,
    });

    return NextResponse.json({ memories });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 401 }
    );
  }
}
