import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { encryptSecret, maskSecret } from "@/lib/runtime/secrets";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "company_id is required" }, { status: 400 });
    }

    const { service } = await requireUserAndCompany(request, companyId);

    const { data, error } = await service
      .from("agent_model_keys")
      .select("id, company_id, agent_id, provider, label, masked_key, is_default, last_used_at, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ keys: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      agent_id = null,
      provider,
      label,
      api_key,
      is_default = true,
    } = body;

    if (!company_id || !provider || !api_key) {
      return NextResponse.json(
        { error: "company_id, provider and api_key are required" },
        { status: 400 }
      );
    }

    const { userId, service } = await requireUserAndCompany(request, company_id);

    if (is_default) {
      let query = service
        .from("agent_model_keys")
        .update({ is_default: false })
        .eq("company_id", company_id)
        .eq("provider", provider);

      if (agent_id) {
        query = query.eq("agent_id", agent_id);
      } else {
        query = query.is("agent_id", null);
      }

      await query;
    }

    const { data, error } = await service
      .from("agent_model_keys")
      .insert({
        company_id,
        agent_id,
        provider,
        label: label || `${provider} key`,
        encrypted_key: encryptSecret(api_key),
        masked_key: maskSecret(api_key),
        is_default,
        created_by: userId,
      })
      .select("id, company_id, agent_id, provider, label, masked_key, is_default, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ key: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 401 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { company_id, key_id } = body;

    if (!company_id || !key_id) {
      return NextResponse.json(
        { error: "company_id and key_id are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const { error } = await service
      .from("agent_model_keys")
      .delete()
      .eq("company_id", company_id)
      .eq("id", key_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 401 }
    );
  }
}
