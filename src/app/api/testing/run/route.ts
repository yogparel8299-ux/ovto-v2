import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { runSystemTests } from "@/lib/runtime/testing-runtime";

export async function POST(request:Request){

  try{

    const body = await request.json();

    const { service } =
      await requireUserAndCompany(
        request,
        body.company_id
      );

    const result =
      await runSystemTests({
        supabase:service,
        companyId:body.company_id
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
