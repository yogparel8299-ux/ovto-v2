import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { runComplianceChecks } from "@/lib/runtime/compliance-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.company_id) {
      return NextResponse.json(
        { error: "company_id is required" },
        { status: 400 }
      );
    }

    const { service } =
      await requireUserAndCompany(
        request,
        body.company_id
      );

    const result =
      await runComplianceChecks({
        supabase: service,
        companyId: body.company_id,
      });

    return NextResponse.json(result);

  } catch (error) {

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
