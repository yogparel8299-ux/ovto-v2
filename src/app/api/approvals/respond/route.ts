import { NextResponse } from "next/server";
import { requireUserAndCompany } from "@/lib/server/supabase-service";
import { approveAndResume, rejectApproval } from "@/lib/runtime/approval-runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      company_id,
      approval_id,
      decision,
      reason = "",
    } = body;

    if (!company_id || !approval_id || !decision) {
      return NextResponse.json(
        { error: "company_id, approval_id and decision are required" },
        { status: 400 }
      );
    }

    const { userId, service } = await requireUserAndCompany(request, company_id);

    if (decision === "approved" || decision === "approve") {
      const result = await approveAndResume({
        supabase: service,
        companyId: company_id,
        approvalId: approval_id,
        approvedBy: userId,
      });

      return NextResponse.json(result);
    }

    if (decision === "rejected" || decision === "reject") {
      const result = await rejectApproval({
        supabase: service,
        companyId: company_id,
        approvalId: approval_id,
        reason,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "decision must be approved or rejected" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
