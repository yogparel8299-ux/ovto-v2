import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { ingestDatasetText } from "@/lib/runtime/rag-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      dataset_id,
      text,
    } = body;

    if (!company_id || !dataset_id || !text) {
      return NextResponse.json(
        { error: "company_id, dataset_id and text are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const result = await ingestDatasetText({
      supabase: service,
      companyId: company_id,
      datasetId: dataset_id,
      text,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
