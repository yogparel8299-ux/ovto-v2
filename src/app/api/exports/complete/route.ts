import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/server/supabase-service";
import { generateWorkspaceExport } from "@/lib/runtime/export-runtime";

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
    const { export_id, company_id } = body;

    if (!export_id || !company_id) {
      return NextResponse.json(
        { error: "export_id and company_id are required" },
        { status: 400 }
      );
    }

    const service = getServiceSupabase();

    const result = await generateWorkspaceExport({
      supabase: service,
      exportId: export_id,
      companyId: company_id,
    });

    return NextResponse.json({ export: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
