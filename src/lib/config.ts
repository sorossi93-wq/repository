export const siteConfig = {
  couple: {
    names: "Sofia & Campbell",
    fullNames: "Sofia Rossi & Campbell Benson",
    date: "September 12, 2026",
  },
  /** Where claim notifications are sent (override with NOTIFICATION_EMAIL on Vercel). */
  notificationEmail: "sorossi93@gmail.com",
  currency: "EUR",
  currencySymbol: "€",
  messages: {
    heroSubtitle:
      "We're not expecting presents — many of you are travelling from far away, and having you there is enough.",
    photoPromise:
      "Honest confession: we might have fifteen photos from the last six years together. If you pick a gift, we'll take it as a good excuse to document the trip — and send you proof.",
    honeymoonIntro:
      "One thing we bonded over is our love for the sea and swimming, so you will see very strong themes across our planned honeymoon activities.",
    materialIntro:
      "We don't need much for our house, but if anybody prefers physical gifts we won't say no to upgrading our key kitchen things.",
    maxIntro:
      "Six instalments of €250 toward a golden retriever named Max — chip in and we'll collectively fund the dog (~€1,500). Campbell was consulted once; Sofia has decided to take matters into her own hands. He still hasn't seen this section.",
  },
};

export function getNotificationEmail(): string {
  return process.env.NOTIFICATION_EMAIL || siteConfig.notificationEmail;
}

/** Resend sender — use onboarding@resend.dev for testing; verify your domain for production. */
export function getResendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    "Wedding Registry <onboarding@resend.dev>"
  );
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export function getRevolutUsername(): string {
  return (
    process.env.NEXT_PUBLIC_REVOLUT_USERNAME ||
    process.env.REVOLUT_USERNAME ||
    "sofavq1yt"
  );
}

export function getBankIban(): string {
  return (process.env.BANK_IBAN || "NL80ABNA0112897711").replace(/\s/g, "").toUpperCase();
}

export function getBankAccountName(): string {
  return process.env.BANK_ACCOUNT_NAME || "C G BENSON CJ";
}

export function getBankBic(): string {
  return process.env.BANK_BIC || "ABNANL2A";
}

export function formatBankIbanDisplay(iban?: string): string {
  const clean = (iban || getBankIban()).replace(/\s/g, "").toUpperCase();
  if (clean.startsWith("NL") && clean.length === 18) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12, 16)} ${clean.slice(16)}`;
  }
  return clean.replace(/(.{4})/g, "$1 ").trim();
}
