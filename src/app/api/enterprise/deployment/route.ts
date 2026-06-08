import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { configurePrivateDeployment } from "@/lib/runtime/private-deployment-runtime";

export async function POST(request:Request){
  try{

    const body = await request.json();

    const { service } =
      await requireUserAndCompany(
        request,
        body.company_id
      );

    const result =
      await configurePrivateDeployment({
        supabase: service,
        companyId: body.company_id,
        deploymentType: body.deployment_type,
        environment: body.environment,
        configuration: body.configuration || {}
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
