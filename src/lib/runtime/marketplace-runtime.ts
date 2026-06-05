import type { SupabaseClient } from "@supabase/supabase-js";
import { writeActivity, writeAudit } from "./run-utils";

export function calculateRevenueSplit(amountCents: number) {
  const platformFeeCents = Math.round(amountCents * 0.2);
  const sellerAmountCents = amountCents - platformFeeCents;

  return {
    platformFeeCents,
    sellerAmountCents,
  };
}

export async function processMarketplaceSale(params: {
  supabase: SupabaseClient;
  buyerCompanyId: string;
  buyerUserId: string;
  marketplaceItemId: string;
}) {
  const { data: item, error: itemError } = await params.supabase
    .from("marketplace_items")
    .select("*")
    .eq("id", params.marketplaceItemId)
    .eq("is_published", true)
    .single();

  if (itemError || !item) {
    throw new Error(itemError?.message || "Marketplace item not found");
  }

  const amountCents = Number(item.price_cents || 0);
  const split = calculateRevenueSplit(amountCents);

  const { data: order, error: orderError } = await params.supabase
    .from("marketplace_orders")
    .insert({
      buyer_company_id: params.buyerCompanyId,
      buyer_user_id: params.buyerUserId,
      marketplace_item_id: item.id,
      seller_company_id: item.seller_company_id,
      amount_cents: amountCents,
      platform_fee_cents: split.platformFeeCents,
      seller_amount_cents: split.sellerAmountCents,
      currency: item.currency || "usd",
      status: "completed",
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  let { data: wallet } = await params.supabase
    .from("seller_wallets")
    .select("*")
    .eq("company_id", item.seller_company_id)
    .maybeSingle();

  if (!wallet) {
    const created = await params.supabase
      .from("seller_wallets")
      .insert({
        company_id: item.seller_company_id,
        balance_cents: split.sellerAmountCents,
        lifetime_earnings_cents: split.sellerAmountCents,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    wallet = created.data;
  } else {
    await params.supabase
      .from("seller_wallets")
      .update({
        balance_cents: Number(wallet.balance_cents || 0) + split.sellerAmountCents,
        lifetime_earnings_cents:
          Number(wallet.lifetime_earnings_cents || 0) + split.sellerAmountCents,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wallet.id);
  }

  await params.supabase
    .from("marketplace_items")
    .update({
      downloads_count: Number(item.downloads_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", item.id);

  await writeActivity({
    supabase: params.supabase,
    companyId: item.seller_company_id,
    type: "marketplace.sale",
    title: "Marketplace sale completed",
    description: `${item.title} was sold.`,
    relatedTable: "marketplace_orders",
    relatedId: order.id,
  });

  await writeAudit({
    supabase: params.supabase,
    companyId: item.seller_company_id,
    eventType: "marketplace.sale_processed",
    description: "Marketplace order processed and seller wallet credited.",
    metadata: {
      order_id: order.id,
      marketplace_item_id: item.id,
      amount_cents: amountCents,
      platform_fee_cents: split.platformFeeCents,
      seller_amount_cents: split.sellerAmountCents,
    },
  });

  return {
    order,
    sellerWallet: wallet,
  };
}

export async function requestSellerPayout(params: {
  supabase: SupabaseClient;
  companyId: string;
  amountCents: number;
  payoutProvider?: string;
}) {
  const { data: wallet, error } = await params.supabase
    .from("seller_wallets")
    .select("*")
    .eq("company_id", params.companyId)
    .single();

  if (error || !wallet) {
    throw new Error(error?.message || "Seller wallet not found");
  }

  if (Number(wallet.balance_cents || 0) < params.amountCents) {
    throw new Error("Insufficient seller wallet balance");
  }

  const { data: payout, error: payoutError } = await params.supabase
    .from("seller_payouts")
    .insert({
      company_id: params.companyId,
      wallet_id: wallet.id,
      amount_cents: params.amountCents,
      payout_provider: params.payoutProvider || "manual",
      payout_reference: null,
      status: "requested",
    })
    .select()
    .single();

  if (payoutError) throw new Error(payoutError.message);

  await params.supabase
    .from("seller_wallets")
    .update({
      balance_cents: Number(wallet.balance_cents || 0) - params.amountCents,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wallet.id);

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "seller_payout.requested",
    description: "Seller payout requested.",
    metadata: {
      payout_id: payout.id,
      amount_cents: params.amountCents,
    },
  });

  return {
    payout,
  };
}

export async function markSellerPayoutPaid(params: {
  supabase: SupabaseClient;
  companyId: string;
  payoutId: string;
  payoutReference: string;
}) {
  const { data: payout, error } = await params.supabase
    .from("seller_payouts")
    .update({
      status: "paid",
      payout_reference: params.payoutReference,
    })
    .eq("id", params.payoutId)
    .eq("company_id", params.companyId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "seller_payout.paid",
    description: "Seller payout marked as paid.",
    metadata: {
      payout_id: params.payoutId,
      payout_reference: params.payoutReference,
    },
  });

  return {
    payout,
  };
}
