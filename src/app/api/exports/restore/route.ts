import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { restoreWorkspaceExport } from "@/lib/runtime/restore-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      export_id,
    } = body;

    if (!company_id || !export_id) {
      return NextResponse.json(
        { error: "company_id and export_id are required" },
        { status: 400 }
      );
    }

    const { userId, service } = await requireUserAndCompany(request, company_id);

    const result = await restoreWorkspaceExport({
      supabase: service,
      companyId: company_id,
      exportId: export_id,
      restoredBy: userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
