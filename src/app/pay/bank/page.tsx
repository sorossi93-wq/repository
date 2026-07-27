import Link from "next/link";
import { findGiftById } from "@/data/gifts";
import { getBankTransferDetails } from "@/lib/bank";
import { formatBankIbanDisplay } from "@/lib/config";
import { BankPayView } from "./BankPayView";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BankPayPageProps {
  searchParams: Promise<{
    giftId?: string;
    guestName?: string;
    giftName?: string;
    amount?: string;
  }>;
}

export default async function BankPayPage({ searchParams }: BankPayPageProps) {
  const params = await searchParams;
  const giftId = params.giftId?.trim() || "";
  const guestName = params.guestName?.trim() || "";
  const amountRaw = params.amount?.trim() || "";

  const found = giftId ? findGiftById(giftId) : null;
  const giftName = params.giftName?.trim() || found?.gift.name || "Registry Gift";
  const amount = amountRaw ? Number.parseFloat(amountRaw) : found?.gift.price ?? Number.NaN;

  if (!guestName || !Number.isFinite(amount) || amount <= 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory px-6 py-16">
        <div className="w-full max-w-md rounded-card-lg bg-white p-10 text-center shadow-modal">
          <h1 className="font-display text-3xl font-light text-wine">Missing details</h1>
          <p className="mt-4 text-ink-muted">
            Please start from the registry and choose bank transfer again.
          </p>
          <Link href="/" className="btn-primary mt-8 inline-flex">
            Back to Registry
          </Link>
        </div>
      </main>
    );
  }

  const details = getBankTransferDetails(amount, giftName, guestName, formatBankIbanDisplay());

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6 py-16">
      <BankPayView giftName={giftName} guestName={guestName} details={details} />
    </main>
  );
}
