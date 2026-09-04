/** Strip accents and non-ASCII for SEPA / Revolut payloads. */
export function toAsciiPaymentText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
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

/** Revolut.me path segments break on spaces — use underscores in the URL only. */
export function buildRevolutPathNote(giftName: string, guestName: string): string {
  const gift = (toAsciiPaymentText(giftName) || "gift").replace(/\s+/g, "_");
  const guest = (toAsciiPaymentText(guestName) || "guest").replace(/\s+/g, "_");
  const note = `Gift_${gift}_from_${guest}`;
  return note.replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 50);
}
