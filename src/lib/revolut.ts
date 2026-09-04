import { getRevolutUsername } from "@/lib/config";
import { buildQrPaymentReference } from "@/lib/payment-reference";

export interface RevolutPaymentDetails {
  url: string;
  amount: number;
  username: string;
  reference: string;
}

function formatMajorAmount(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

/**
 * Revolut.me link with euros in major units (50 = €50).
 * A long `note` query has broken the prefill before — keep the URL clean
 * and show the reference separately for guests to copy.
 */
export function buildRevolutPaymentDetails(
  amount: number,
  giftName: string,
  guestName: string
): RevolutPaymentDetails {
  const username = getRevolutUsername().replace(/^@/, "").toLowerCase();
  const reference = buildQrPaymentReference(giftName, guestName);
  const major = formatMajorAmount(amount);

  const queryParams = new URLSearchParams({
    amount: major,
    currency: "EUR",
  });
  const url = `https://revolut.me/${encodeURIComponent(username)}/${major}EUR?${queryParams.toString()}`;

  return { url, amount, username, reference };
}

/** @deprecated Prefer buildRevolutPaymentDetails for API responses. */
export function buildRevolutUrl(amount: number, giftName: string, guestName: string): string {
  return buildRevolutPaymentDetails(amount, giftName, guestName).url;
}
