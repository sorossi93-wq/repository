/** Strip accents and non-ASCII for SEPA / Revolut payloads. */
export function toAsciiPaymentText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Display / manual transfer reference (gift name + guest). */
export function buildPaymentReference(giftName: string, guestName: string): string {
  const gift = toAsciiPaymentText(giftName) || "Registry gift";
  const guest = toAsciiPaymentText(guestName) || "guest";
  return `Gift: ${gift} from ${guest}`;
}

/** Short ASCII reference for SEPA QR / Revolut note (max 140 chars per EPC069-12 v3.1). */
export function buildQrPaymentReference(giftName: string, guestName: string): string {
  return buildPaymentReference(giftName, guestName).slice(0, 140);
}