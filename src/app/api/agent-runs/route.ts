import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const agentId = searchParams.get("agent_id");

    if (!companyId) {
      return NextResponse.json({ error: "company_id is required" }, { status: 400 });
    }

    const { service } = await requireUserAndCompany(request, companyId);

    let query = service
      .from("agent_runs")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (agentId) {
      query = query.eq("agent_id", agentId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ runs: data || [] });
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
      agent_id,
      task_id = null,
      input,
      trigger_source = "manual",
      trigger_payload = {},
    } = body;

    if (!company_id || !agent_id || !input) {
      return NextResponse.json(
        { error: "company_id, agent_id and input are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const { data: agent, error: agentError } = await service
      .from("agents")
      .select("id, company_id")
      .eq("id", agent_id)
      .eq("company_id", company_id)
      .maybeSingle();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const { data, error } = await service
      .from("agent_runs")
      .insert({
        company_id,
        agent_id,
        task_id,
        status: "queued",
        trigger_source,
        trigger_payload,
        input,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      run: data,
      message: "Agent run queued",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 401 }
    );
  }
}
