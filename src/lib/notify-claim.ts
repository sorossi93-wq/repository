import { findGiftById } from "@/data/gifts";
import {
  getNotificationEmail,
  getResendFromEmail,
  siteConfig,
} from "@/lib/config";

export type PaymentMethod = "paypal" | "revolut" | "bank";

export interface ClaimNotificationDetails {
  giftId: string;
  giftedBy: string;
  claimedAt: string;
  giftName?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
}

export interface ClaimNotificationSendResult {
  ok: boolean;
  error?: string;
  messageId?: string;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  paypal: "PayPal",
  revolut: "Revolut",
  bank: "Bank transfer",
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatClaimTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Amsterdam",
  });
}

/**
 * Sends an email via Resend when a gift is claimed.
 * Requires RESEND_API_KEY on Vercel. Optional: NOTIFICATION_EMAIL, RESEND_FROM_EMAIL.
 */
export async function sendClaimNotification(
  details: ClaimNotificationDetails
): Promise<ClaimNotificationSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = getNotificationEmail();
  const from = getResendFromEmail();

  if (!apiKey) {
    const error = "RESEND_API_KEY not set";
    console.error(
      "[claim-email] RESEND_API_KEY not set — skipping notification.",
      `Would have sent to ${to} from ${from}. Add RESEND_API_KEY in Vercel → Settings → Environment Variables, then redeploy.`
    );
    return { ok: false, error };
  }

  const found = findGiftById(details.giftId);
  const giftName = details.giftName || found?.gift.name || details.giftId;
  const amount = details.amount ?? found?.gift.price;
  const paymentLabel = details.paymentMethod
    ? PAYMENT_LABELS[details.paymentMethod]
    : null;
  const timestamp = formatClaimTimestamp(details.claimedAt);
  const amountText =
    amount != null
      ? `${siteConfig.currencySymbol}${amount} ${siteConfig.currency}`
      : "Not specified";

  const subject = `Registry: ${giftName} claimed by ${details.giftedBy}`;

  const html = `
    <div style="font-family: Georgia, serif; color: #2c2c2c; line-height: 1.6;">
      <h2 style="color: #6b2737; font-weight: normal;">New gift claimed</h2>
      <p>Someone just marked a gift as claimed on your wedding registry.</p>
      <table style="margin: 24px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 16px 8px 0; color: #666;">Gift</td>
          <td style="padding: 8px 0;"><strong>${escapeHtml(giftName)}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 16px 8px 0; color: #666;">Guest</td>
          <td style="padding: 8px 0;">${escapeHtml(details.giftedBy)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px 8px 0; color: #666;">Amount</td>
          <td style="padding: 8px 0;">${escapeHtml(amountText)}</td>
        </tr>
        ${
          paymentLabel
            ? `<tr>
          <td style="padding: 8px 16px 8px 0; color: #666;">Payment</td>
          <td style="padding: 8px 0;">${escapeHtml(paymentLabel)}</td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding: 8px 16px 8px 0; color: #666;">Claimed at</td>
          <td style="padding: 8px 0;">${escapeHtml(timestamp)}</td>
        </tr>
      </table>
      <p style="color: #888; font-size: 14px;">${escapeHtml(siteConfig.couple.names)} wedding registry</p>
    </div>
  `.trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    const bodyText = await res.text();

    if (!res.ok) {
      const error = `${res.status}: ${bodyText.slice(0, 200)}`;
      console.error(
        "[claim-email] Resend API error:",
        res.status,
        bodyText,
        { from, to, giftId: details.giftId }
      );
      return { ok: false, error };
    }

    let messageId: string | undefined;
    try {
      const parsed = JSON.parse(bodyText) as { id?: string };
      messageId = parsed.id;
    } catch {
      /* non-json success body */
    }

    console.info("[claim-email] Sent claim notification", { from, to, giftId: details.giftId, messageId });
    return { ok: true, messageId };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[claim-email] Network error sending notification:", error, { from, to });
    return { ok: false, error };
  }
}
