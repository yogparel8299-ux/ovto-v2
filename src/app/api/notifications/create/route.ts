import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { createSystemNotification } from "@/lib/runtime/notification-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      title,
      message,
      notification_type = "system",
      priority = "normal",
      metadata = {},
    } = body;

    if (!company_id || !title || !message) {
      return NextResponse.json(
        { error: "company_id, title and message are required" },
        { status: 400 }
      );
    }

    const { service } = await requireUserAndCompany(request, company_id);

    const result = await createSystemNotification({
      supabase: service,
      companyId: company_id,
      title,
      message,
      notificationType: notification_type,
      priority,
      metadata,
    });

    return NextResponse.json({ notifications: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
