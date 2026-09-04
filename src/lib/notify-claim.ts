import { findGiftById } from "@/data/gifts";
import {
  getNotificationEmail,
  getResendFromEmail,
  siteConfig,
} from "@/lib/config";

export type PaymentMethod = "revolut" | "bank";

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
  provider?: "resend" | "formsubmit";
  needsInboxConfirmation?: boolean;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
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

function buildClaimMessage(details: ClaimNotificationDetails) {
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
  const text = [
    "Someone just marked a gift as claimed on your wedding registry.",
    "",
    `Gift: ${giftName}`,
    `Guest: ${details.giftedBy}`,
    `Amount: ${amountText}`,
    paymentLabel ? `Payment: ${paymentLabel}` : null,
    `Claimed at: ${timestamp}`,
    "",
    `${siteConfig.couple.names} wedding registry`,
  ]
    .filter(Boolean)
    .join("\n");

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

  return {
    subject,
    text,
    html,
    giftName,
    amountText,
    paymentLabel,
    timestamp,
  };
}

async function sendViaResend(
  to: string,
  message: ReturnType<typeof buildClaimMessage>,
  giftId: string
): Promise<ClaimNotificationSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getResendFromEmail();

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not set", provider: "resend" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  const bodyText = await res.text();
  if (!res.ok) {
    const error = `${res.status}: ${bodyText.slice(0, 200)}`;
    console.error("[claim-email] Resend API error:", res.status, bodyText, { from, to, giftId });
    return { ok: false, error, provider: "resend" };
  }

  let messageId: string | undefined;
  try {
    messageId = (JSON.parse(bodyText) as { id?: string }).id;
  } catch {
    /* ignore */
  }

  console.info("[claim-email] Sent via Resend", { from, to, giftId, messageId });
  return { ok: true, messageId, provider: "resend" };
}

async function sendViaFormSubmit(
  to: string,
  message: ReturnType<typeof buildClaimMessage>,
  details: ClaimNotificationDetails
): Promise<ClaimNotificationSendResult> {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: message.subject,
      _template: "table",
      _captcha: "false",
      name: `${siteConfig.couple.names} Wedding Registry`,
      gift: message.giftName,
      guest: details.giftedBy,
      amount: message.amountText,
      payment: message.paymentLabel || "Not specified",
      claimed_at: message.timestamp,
      message: message.text,
    }),
  });

  const bodyText = await res.text();
  let parsed: { success?: string | boolean; message?: string } = {};
  try {
    parsed = JSON.parse(bodyText) as { success?: string | boolean; message?: string };
  } catch {
    parsed = { message: bodyText.slice(0, 200) };
  }

  const successValue = parsed.success;
  const ok = successValue === true || successValue === "true";
  const reply = (parsed.message || bodyText).slice(0, 300);
  const needsInboxConfirmation = /confirm|activat|click the link/i.test(reply);

  if (!res.ok || !ok) {
    console.error("[claim-email] FormSubmit failed", { to, status: res.status, reply });
    return {
      ok: false,
      error: reply || `FormSubmit ${res.status}`,
      provider: "formsubmit",
      needsInboxConfirmation,
    };
  }

  console.info("[claim-email] Sent via FormSubmit", { to, giftId: details.giftId, reply });
  return {
    ok: true,
    provider: "formsubmit",
    needsInboxConfirmation,
    messageId: reply,
  };
}

/**
 * Notify Sofia when a gift is claimed.
 * Waits for delivery so Vercel does not freeze the function mid-send.
 * Uses Resend when an API key exists, and FormSubmit otherwise (one inbox confirmation).
 */
export async function sendClaimNotification(
  details: ClaimNotificationDetails
): Promise<ClaimNotificationSendResult> {
  const to = getNotificationEmail();
  const message = buildClaimMessage(details);

  try {
    const resend = await sendViaResend(to, message, details.giftId);
    if (resend.ok) return resend;
    console.warn("[claim-email] Resend unavailable, trying FormSubmit:", resend.error);
  } catch (err) {
    console.error("[claim-email] Resend threw, trying FormSubmit", err);
  }

  try {
    return await sendViaFormSubmit(to, message, details);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[claim-email] FormSubmit network error:", error, { to });
    return { ok: false, error, provider: "formsubmit" };
  }
}
