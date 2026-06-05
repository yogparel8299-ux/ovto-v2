import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { processMarketplaceSale } from "@/lib/runtime/marketplace-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      buyer_company_id,
      buyer_user_id,
      marketplace_item_id,
    } = body;

    if (!buyer_company_id || !buyer_user_id || !marketplace_item_id) {
      return NextResponse.json(
        { error: "buyer_company_id, buyer_user_id and marketplace_item_id are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, buyer_company_id);

    const result = await processMarketplaceSale({
      supabase: service,
      buyerCompanyId: buyer_company_id,
      buyerUserId: buyer_user_id,
      marketplaceItemId: marketplace_item_id,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
