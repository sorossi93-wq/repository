import { getPayPalEmail, getPayPalUsername } from "@/lib/config";
import { buildPaymentReference } from "@/lib/payment-reference";

export function formatPayPalAmount(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

/** PayPal.Me — works with personal accounts. Amount + EUR are in the path. */
export function buildPayPalMeUrl(amount: number): string {
  const username = getPayPalUsername().replace(/^@/, "");
  return `https://www.paypal.com/paypalme/${encodeURIComponent(username)}/${formatPayPalAmount(amount)}EUR`;
}

/**
 * Website-payments fallback. Personal accounts often reject this;
 * keep it as a second link, not the only path.
 */
export function buildPayPalXclickUrl(
  amount: number,
  giftName: string,
  guestName: string,
  giftId: string
): string {
  const params = new URLSearchParams({
    cmd: "_xclick",
    business: getPayPalEmail(),
    amount: amount.toFixed(2),
    currency_code: "EUR",
    item_name: buildPaymentReference(giftName, guestName),
    no_shipping: "1",
    charset: "utf-8",
    rm: "1",
    custom: giftId,
  });
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
}

export function buildPayPalUrl(amount: number): string {
  return buildPayPalMeUrl(amount);
}
