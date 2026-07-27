import { getRevolutUsername } from "@/lib/config";
import { buildQrPaymentReference } from "@/lib/payment-reference";

export interface RevolutPaymentDetails {
  /** Query-param link — amount in minor units (cents). */
  url: string;
  amount: number;
  username: string;
  reference: string;
}

/**
 * Revolut.me pre-filled payment link (query params).
 *
 * Amount uses minor units / cents (25000 = €250; 250 = €2.50).
 *
 * @see https://stackoverflow.com/questions/67294510/is-it-possible-to-pre-fill-fields-in-revolut-me
 * @see https://stackoverflow.com/questions/74881055/creating-and-ntegrating-payment-form-using-html-and-css-with-revolut
 */
export function buildRevolutPaymentDetails(
  amount: number,
  giftName: string,
  guestName: string
): RevolutPaymentDetails {
  const username = getRevolutUsername().toLowerCase();
  const reference = buildQrPaymentReference(giftName, guestName);

  const queryParams = new URLSearchParams({
    amount: String(Math.round(amount * 100)),
    currency: "EUR",
    note: reference,
  });
  const url = `https://revolut.me/${username}?${queryParams.toString()}`;

  return { url, amount, username, reference };
}

/** @deprecated Prefer buildRevolutPaymentDetails for API responses. */
export function buildRevolutUrl(amount: number, giftName: string, guestName: string): string {
  return buildRevolutPaymentDetails(amount, giftName, guestName).url;
}
