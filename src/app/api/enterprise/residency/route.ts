import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { configureDataResidency } from "@/lib/runtime/data-residency-runtime";

export async function POST(request:Request){
  try{

    const body = await request.json();

    const { service } =
      await requireUserAndCompany(
        request,
        body.company_id
      );

    const result =
      await configureDataResidency({
        supabase: service,
        companyId: body.company_id,
        region: body.region
      });

    return NextResponse.json(result);

  }catch(error){

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error"
      },
      { status:500 }
    );
  }
}
