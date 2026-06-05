import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { cloneCompany } from "@/lib/runtime/company-clone-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      new_name = null,
    } = body;

    if (!company_id) {
      return NextResponse.json(
        { error: "company_id is required" },
        { status: 400 }
      );
    }

    const { userId, service } = await requireUserAndCompany(request, company_id);

    const result = await cloneCompany({
      supabase: service,
      companyId: company_id,
      userId,
      newName: new_name || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
