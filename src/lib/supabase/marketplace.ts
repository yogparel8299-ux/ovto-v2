import { getSupabase } from "./client";

export type MarketplaceItemRecord = {
  id: string;
  name: string;
  itemType: string | null;
  description: string | null;
};

export async function fetchMarketplaceItems(
  companyId: string
): Promise<MarketplaceItemRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("marketplace_items")
    .select("id, name, item_type, description")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    itemType: row.item_type,
    description: row.description,
  }));
}
