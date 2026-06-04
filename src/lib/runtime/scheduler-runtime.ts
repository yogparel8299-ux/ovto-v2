import type { SupabaseClient } from "@supabase/supabase-js";
import { nowIso, writeActivity, writeAudit } from "./run-utils";

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function nextFromSimpleCron(cron: string) {
  const now = new Date();
  const clean = cron.trim().toLowerCase();

  if (clean === "@hourly") return addMinutes(now, 60);
  if (clean === "@daily") return addMinutes(now, 24 * 60);
  if (clean === "@weekly") return addMinutes(now, 7 * 24 * 60);

  const parts = clean.split(/\s+/);

  if (parts.length === 5) {
    const [minuteRaw, hourRaw] = parts;
    const minute = minuteRaw === "*" ? now.getMinutes() : Number(minuteRaw);
    const hour = hourRaw === "*" ? now.getHours() : Number(hourRaw);

    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setMinutes(Number.isFinite(minute) ? minute : now.getMinutes());
    next.setHours(Number.isFinite(hour) ? hour : now.getHours());

    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }

  return addMinutes(now, 60);
}

export async function runDueSchedules(params: {
  supabase: SupabaseClient;
  limit?: number;
}) {
  const { supabase } = params;
  const limit = params.limit ?? 25;
  const now = nowIso();

  const { data: schedules, error } = await supabase
    .from("agent_schedules")
    .select("*")
    .eq("enabled", true)
    .lte("next_run_at", now)
    .order("next_run_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  const createdRuns: any[] = [];

  for (const schedule of schedules || []) {
    const nextRunAt = nextFromSimpleCron(schedule.cron_expression).toISOString();

    const { data: run, error: runError } = await supabase
      .from("agent_runs")
      .insert({
        company_id: schedule.company_id,
        agent_id: schedule.agent_id,
        status: "queued",
        trigger_source: "schedule",
        trigger_payload: {
          schedule_id: schedule.id,
          schedule_name: schedule.name,
          cron_expression: schedule.cron_expression,
          timezone: schedule.timezone,
        },
        input: schedule.payload || {
          prompt: `Run scheduled task: ${schedule.name}`,
        },
      })
      .select()
      .single();

    if (!runError && run) {
      createdRuns.push(run);

      await writeActivity({
        supabase,
        companyId: schedule.company_id,
        agentId: schedule.agent_id,
        type: "schedule.agent_run_queued",
        title: "Scheduled agent run queued",
        description: `Schedule "${schedule.name}" created an agent run.`,
        relatedTable: "agent_runs",
        relatedId: run.id,
      });
    }

    await supabase
      .from("agent_schedules")
      .update({
        last_run_at: now,
        next_run_at: nextRunAt,
        updated_at: nowIso(),
      })
      .eq("id", schedule.id);

    await writeAudit({
      supabase,
      companyId: schedule.company_id,
      eventType: "schedule.processed",
      description: `Schedule "${schedule.name}" was processed.`,
      metadata: {
        schedule_id: schedule.id,
        created_run_id: run?.id || null,
        next_run_at: nextRunAt,
      },
    });
  }

  return {
    processed: schedules?.length || 0,
    createdRuns,
  };
}
