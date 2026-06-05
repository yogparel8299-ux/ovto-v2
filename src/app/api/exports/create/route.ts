import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { createWorkspaceExport } from "@/lib/runtime/export-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, export_type = "full" } = body;

    if (!company_id) {
      return NextResponse.json({ error: "company_id is required" }, { status: 400 });
    }

    const { userId, service } = await requireUserAndCompany(request, company_id);

    const exportJob = await createWorkspaceExport({
      supabase: service,
      companyId: company_id,
      requestedBy: userId,
      exportType: export_type,
    });

    return NextResponse.json({ export: exportJob });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
