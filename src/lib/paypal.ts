import { getPayPalEmail, getPayPalUsername, getSiteUrl } from "@/lib/config";
import { buildPaymentReference } from "@/lib/payment-reference";

export function buildPayPalUrl(
  amount: number,
  giftName: string,
  guestName: string,
  giftId: string
): string {
  const currency = "EUR";
  const amountStr = amount.toFixed(2);
  const itemName = buildPaymentReference(giftName, guestName);
  const siteUrl = getSiteUrl();

  const returnParams = new URLSearchParams({ gift: giftId, name: guestName });
  const returnUrl = `${siteUrl}/thank-you?${returnParams.toString()}`;
  const cancelUrl = siteUrl;

  const paypalEmail = getPayPalEmail();
  if (paypalEmail) {
    const params = new URLSearchParams({
      cmd: "_xclick",
      business: paypalEmail,
      amount: amountStr,
      currency_code: currency,
      item_name: itemName,
      no_shipping: "1",
      return: returnUrl,
      cancel_return: cancelUrl,
      charset: "utf-8",
      rm: "2",
      custom: giftId,
    });
    return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
  }

  const username = getPayPalUsername();
  return `https://paypal.me/${encodeURIComponent(username)}/${amountStr}${currency}`;
}
