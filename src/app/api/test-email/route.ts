import { NextResponse } from "next/server";
import { getNotificationEmail, getResendFromEmail } from "@/lib/config";
import { sendClaimNotification } from "@/lib/notify-claim";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_SANDBOX_HINT =
  "onboarding@resend.dev only sends to the Resend account owner's email. Sign up at resend.com with sorossi93@gmail.com, or verify a domain and set RESEND_FROM_EMAIL.";

/**
 * Sends a test claim notification for diagnosing Resend setup.
 * Visit /api/test-email after deploy.
 */
export async function GET() {
  const to = getNotificationEmail();
  const from = getResendFromEmail();

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      success: false,
      error: "RESEND_API_KEY not set",
      to,
      from,
      hint: RESEND_SANDBOX_HINT,
    });
  }

  const result = await sendClaimNotification({
    giftId: "test-gift",
    giftedBy: "Test Guest",
    claimedAt: new Date().toISOString(),
    giftName: "Test gift (registry email check)",
    amount: 42,
    paymentMethod: "bank",
  });

  return NextResponse.json({
    success: result.ok,
    error: result.error,
    messageId: result.messageId,
    to,
    from,
    hint: RESEND_SANDBOX_HINT,
  });
}
