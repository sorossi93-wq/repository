import { NextResponse } from "next/server";
import { getNotificationEmail, getResendFromEmail } from "@/lib/config";
import { sendClaimNotification } from "@/lib/notify-claim";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

/**
 * Sends a test claim notification.
 * After deploy, open /api/test-email once, then click the FormSubmit
 * confirmation link in Gmail (and spam) if this is the first send.
 */
export async function GET() {
  const to = getNotificationEmail();
  const from = getResendFromEmail();

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
    provider: result.provider,
    needsInboxConfirmation: result.needsInboxConfirmation ?? false,
    to,
    from,
    hint: result.needsInboxConfirmation
      ? `Check ${to} (and spam) for a FormSubmit confirmation email and click the link once. After that, claim emails will arrive automatically.`
      : result.ok
        ? `A test email was sent to ${to}. Check inbox and spam.`
        : "Email did not send. Check Vercel logs, then retry this URL after deploy.",
  });
}
