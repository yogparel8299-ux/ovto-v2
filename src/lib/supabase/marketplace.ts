import { getSupabase } from "./client";

export type MarketplaceAgent = {
  id: string;
  name: string;
  role: string;
  author: string;
  description: string;
  price: number;
  avatarColor: string;
  connectedApps: string[];
  capabilities: string[];
  saves: number;
  featured: boolean;
};

export type MarketplaceSkill = {
  id: string;
  title: string;
  description: string;
  author: string;
  price: number;
  targetRole: string;
  saves: number;
};

export type MarketplaceDataset = {
  id: string;
  name: string;
  size: string;
  type: string;
  description: string;
  author: string;
  price: number;
  saves: number;
};

export type MarketplaceRentalUpdate = {
  timeAgo: string;
  message: string;
  bytesText: string;
};

export type MarketplaceRental = {
  id: string;
  title: string;
  description: string;
  author: string;
  rentPrice: number;
  category: string;
  saves: number;
  liveUpdates: MarketplaceRentalUpdate[];
};

export type MarketplaceData = {
  agents: MarketplaceAgent[];
  skills: MarketplaceSkill[];
  datasets: MarketplaceDataset[];
  rentals: MarketplaceRental[];
};

function meta(row: Record<string, unknown>): Record<string, unknown> {
  const m = row.metadata;
  return m && typeof m === "object" && !Array.isArray(m)
    ? (m as Record<string, unknown>)
    : {};
}

function mapAgent(row: Record<string, unknown>): MarketplaceAgent {
  const m = meta(row);
  return {
    id: String(row.id),
    name: String(row.name ?? row.title ?? "Agent"),
    role: String(m.role ?? row.item_type ?? "Support"),
    author: String(row.author ?? ""),
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    avatarColor: String(
      m.avatar_color ?? "bg-stone-100 text-stone-900 border-stone-200"
    ),
    connectedApps: Array.isArray(m.connected_apps)
      ? (m.connected_apps as string[])
      : [],
    capabilities: Array.isArray(m.capabilities)
      ? (m.capabilities as string[])
      : [],
    saves: Number(m.saves ?? 0),
    featured: Boolean(m.featured ?? false),
  };
}

function mapSkill(row: Record<string, unknown>): MarketplaceSkill {
  const m = meta(row);
  return {
    id: String(row.id),
    title: String(row.name ?? row.title ?? "Skill"),
    description: String(row.description ?? ""),
    author: String(row.author ?? ""),
    price: Number(row.price ?? 0),
    targetRole: String(m.target_role ?? ""),
    saves: Number(m.saves ?? 0),
  };
}

function mapDataset(row: Record<string, unknown>): MarketplaceDataset {
  const m = meta(row);
  return {
    id: String(row.id),
    name: String(row.name ?? "Dataset"),
    size: String(m.size ?? ""),
    type: String(m.file_type ?? m.type ?? ""),
    description: String(row.description ?? ""),
    author: String(row.author ?? ""),
    price: Number(row.price ?? 0),
    saves: Number(m.saves ?? 0),
  };
}

function mapRental(row: Record<string, unknown>): MarketplaceRental {
  const m = meta(row);
  const updates = m.live_updates;
  return {
    id: String(row.id),
    title: String(row.name ?? row.title ?? "Feed"),
    description: String(row.description ?? ""),
    author: String(row.author ?? ""),
    rentPrice: Number(row.price ?? m.rent_price ?? 0),
    category: String(m.category ?? ""),
    saves: Number(m.saves ?? 0),
    liveUpdates: Array.isArray(updates)
      ? (updates as MarketplaceRentalUpdate[])
      : [],
  };
}

export async function fetchMarketplaceData(
  companyId: string
): Promise<MarketplaceData> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("marketplace_items")
    .select(
      "id, name, title, description, author, price, item_type, metadata, file_type"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { agents: [], skills: [], datasets: [], rentals: [] };
  }

  const agents: MarketplaceAgent[] = [];
  const skills: MarketplaceSkill[] = [];
  const datasets: MarketplaceDataset[] = [];
  const rentals: MarketplaceRental[] = [];

  for (const row of data) {
    const type = String(row.item_type ?? "agent").toLowerCase();
    if (type === "skill") skills.push(mapSkill(row));
    else if (type === "dataset") datasets.push(mapDataset(row));
    else if (type === "rental") rentals.push(mapRental(row));
    else agents.push(mapAgent(row));
  }

  return { agents, skills, datasets, rentals };
}
