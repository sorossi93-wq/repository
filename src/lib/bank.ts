import { getBankAccountName, getBankBic, getBankIban } from "@/lib/config";
import { buildPaymentReference } from "@/lib/payment-reference";

export { buildPaymentReference };

/** EPC QR render settings — level M is what banking apps expect per EPC069-12. */
export const EPC_QR_RENDER_OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 2,
  width: 320,
};

export interface BankTransferDetails {
  iban: string;
  ibanDisplay: string;
  accountName: string;
  bic: string;
  amount: number;
  reference: string;
}

/** Strip non-ASCII characters — Dutch banking apps reject em dashes, accents, etc. in EPC QR. */
function toAsciiSepaText(text: string, maxLen: number): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .slice(0, maxLen);
}

/**
 * BIC in EPC v002 QR codes.
 * NL IBANs: leave BIC empty — ABN AMRO and several Dutch apps reject a populated BIC line.
 * BIC is still shown on the bank page for manual transfers.
 */
function qrBicForIban(iban: string, bic: string): string {
  const cleanIban = iban.replace(/\s/g, "").toUpperCase();
  if (cleanIban.startsWith("NL")) return "";
  return bic.replace(/\s/g, "").toUpperCase();
}

/** NL IBAN: NL + 2 check digits + 4-letter bank code + 10 alphanumeric (18 chars). */
export function isValidNlIban(iban: string): boolean {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  return /^NL\d{2}[A-Z]{4}[A-Z0-9]{10}$/.test(clean);
}

/** EPC069-12 payload: 11 LF-separated lines (12th optional), no trailing newline, no CRLF. */
export function validateEpcPayload(payload: string): void {
  if (payload.includes("\r")) {
    throw new Error("EPC payload must use LF line endings only, not CRLF");
  }
  const lines = payload.split("\n");
  if (lines.length < 11 || lines.length > 12) {
    throw new Error(`EPC payload must have 11 or 12 lines, got ${lines.length}`);
  }
  if (payload.endsWith("\n")) {
    throw new Error("EPC payload must not have a trailing newline");
  }
  if (lines[0] !== "BCD") throw new Error("EPC service tag must be BCD");
  if (!["001", "002"].includes(lines[1])) throw new Error("EPC version must be 001 or 002");
  if (lines[3] !== "SCT") throw new Error("EPC identification must be SCT");
  const amountLine = lines[7];
  if (amountLine && !/^EUR\d+\.\d{2}$/.test(amountLine)) {
    throw new Error(`Invalid EPC amount format: ${amountLine}`);
  }
  if (new TextEncoder().encode(payload).length > 331) {
    throw new Error("EPC payload exceeds 331 byte limit");
  }
}

/**
 * SEPA EPC069-12 QR payload for European banking apps.
 * Charset 2 = ISO-8859-1 — best compat for ASCII-only Dutch bank apps (ABN AMRO, ING, bunq).
 */
export function buildEpcQrPayload(params: {
  bic: string;
  beneficiaryName: string;
  iban: string;
  amount: number;
  reference: string;
  charset?: "1" | "2";
}): string {
  const iban = params.iban.replace(/\s/g, "").toUpperCase();
  if (!isValidNlIban(iban)) {
    throw new Error(`Invalid NL IBAN format: ${iban}`);
  }
  const amountStr = `EUR${params.amount.toFixed(2)}`;
  const lines = [
    "BCD",
    "002",
    params.charset ?? "2",
    "SCT",
    qrBicForIban(iban, params.bic),
    toAsciiSepaText(params.beneficiaryName, 70),
    iban,
    amountStr,
    "",
    "",
    toAsciiSepaText(params.reference, 140),
  ];
  const payload = lines.join("\n");
  validateEpcPayload(payload);
  return payload;
}

export function getBankTransferDetails(
  amount: number,
  giftName: string,
  guestName: string,
  ibanDisplay: string
): BankTransferDetails {
  return {
    iban: getBankIban(),
    ibanDisplay,
    accountName: getBankAccountName(),
    bic: getBankBic(),
    amount,
    reference: buildPaymentReference(giftName, guestName),
  };
}
