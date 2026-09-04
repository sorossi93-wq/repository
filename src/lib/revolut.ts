import { getRevolutUsername } from "@/lib/config";
import { buildQrPaymentReference } from "@/lib/payment-reference";

export interface RevolutPaymentDetails {
  /** Short profile link. Always opens the Revolut app, no amount pre-filled. */
  profileUrl: string;
  /** Profile link with the amount pre-filled. Ignored by some app versions. */
  url: string;
  amount: number;
  username: string;
  reference: string;
}

function formatMajorAmount(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

/**
 * Revolut.me only pre-fills when the amount follows the currency in the path
 * and both are lowercase: revolut.me/name/eur50. Query params are ignored, and
 * a `note` segment stops the link opening the app at all.
 *
 * Even in the right shape the long link can fail to open the app on mobile, so
 * callers should offer `profileUrl` as the fallback.
 */
export function buildRevolutPaymentDetails(
  amount: number,
  giftName: string,
  guestName: string
): RevolutPaymentDetails {
  const username = getRevolutUsername().replace(/^@/, "").toLowerCase();
  const reference = buildQrPaymentReference(giftName, guestName);
  const profileUrl = `https://revolut.me/${encodeURIComponent(username)}`;

  return {
    profileUrl,
    url: `${profileUrl}/eur${formatMajorAmount(amount)}`,
    amount,
    username,
    reference,
  };
}

/** @deprecated Prefer buildRevolutPaymentDetails for API responses. */
export function buildRevolutUrl(amount: number, giftName: string, guestName: string): string {
  return buildRevolutPaymentDetails(amount, giftName, guestName).url;
}
