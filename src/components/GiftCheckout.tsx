"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { findGiftById, getDefaultThankYou } from "@/data/gifts";
import { getBankTransferDetails, type BankTransferDetails } from "@/lib/bank";
import { formatBankIbanDisplay, siteConfig } from "@/lib/config";
import { buildRevolutPaymentDetails } from "@/lib/revolut";
import type { Gift } from "@/lib/types";

type PaymentMethod = "revolut" | "bank";
type Step = "form" | "confirm" | "thanks";

interface RevolutPaymentInfo {
  profileUrl: string;
  url: string;
  amount: number;
  username: string;
  reference: string;
}

interface GiftCheckoutProps {
  gift: Gift | null;
  onClose: () => void;
  onClaimed?: () => void;
}

const paymentOptions: { id: PaymentMethod; label: string; description: string }[] = [
  {
    id: "revolut",
    label: "Revolut",
    description: "One tap opens Revolut with the amount ready to copy — then confirm here.",
  },
  {
    id: "bank",
    label: "Bank transfer",
    description: "Copy IBAN, amount and reference into your bank app — then confirm here.",
  },
];

export function GiftCheckout({ gift, onClose, onClaimed }: GiftCheckoutProps) {
  const [guestName, setGuestName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("revolut");
  const [step, setStep] = useState<Step>("form");
  const [nameError, setNameError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [revolutInfo, setRevolutInfo] = useState<RevolutPaymentInfo | null>(null);
  const [bankInfo, setBankInfo] = useState<BankTransferDetails | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gift) {
      setGuestName("");
      setPaymentMethod("revolut");
      setStep("form");
      setNameError(false);
      setLoading(false);
      setClaimError("");
      setThankYouMessage("");
      setRevolutInfo(null);
      setBankInfo(null);
    }
  }, [gift]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (gift) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [gift, onClose]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step]);

  if (!gift) return null;

  function validateName(): string | null {
    const name = guestName.trim();
    if (!name) {
      setNameError(true);
      return null;
    }
    setNameError(false);
    return name;
  }

  function buildThankYouMessage(name: string) {
    const found = findGiftById(gift!.id);
    if (found) {
      return (
        found.gift.thankYou ||
        getDefaultThankYou(gift!.id, found.section.id, found.gift.name)
      );
    }
    return `Your generosity has touched our hearts beyond words, ${name}. We are so grateful you are part of our journey, and we can't wait to celebrate with you on ${siteConfig.couple.date}!`;
  }

  async function handleContinue() {
    const name = validateName();
    if (!name) return;

    setLoading(true);
    setClaimError("");

    try {
      if (paymentMethod === "revolut") {
        const local = buildRevolutPaymentDetails(gift!.price, gift!.name, name);
        setRevolutInfo(local);
        setStep("confirm");

        try {
          const res = await fetch("/api/revolut-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ giftId: gift!.id, guestName: name }),
          });
          if (res.ok) {
            const data = (await res.json()) as RevolutPaymentInfo;
            if (data.url) setRevolutInfo(data);
          }
        } catch {
          /* client-built Revolut link is enough */
        }
        return;
      }

      setBankInfo(
        getBankTransferDetails(gift!.price, gift!.name, name, formatBankIbanDisplay())
      );
      setStep("confirm");
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmPayment() {
    const name = validateName();
    if (!name) return;

    setLoading(true);
    setClaimError("");

    try {
      const payload = {
        giftId: gift!.id,
        giftedBy: name,
        giftName: gift!.name,
        amount: gift!.price,
        paymentMethod,
      };

      let res: Response | null = null;
      let lastError = "Failed to confirm your gift";
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          res = await fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok || res.status === 409) break;
          const data = await res.json().catch(() => ({}));
          lastError = data.error || lastError;
        } catch (err) {
          lastError = err instanceof Error ? err.message : lastError;
          res = null;
        }
      }

      if (!res) throw new Error(lastError);

      if (res.status === 409) {
        setClaimError(
          "This gift was just claimed by someone else. Thank you anyway — please contact us if you sent a payment."
        );
        return;
      }

      if (!res.ok) throw new Error(lastError);

      setThankYouMessage(buildThankYouMessage(name));
      setStep("thanks");
      onClaimed?.();
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-gift-name"
    >
      <div className="flex min-h-[100dvh] items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          className="animate-modal-in relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-ivory shadow-modal sm:rounded-card-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-28 w-full shrink-0 sm:h-40">
            <Image src={gift.image} alt={gift.name} fill sizes="448px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/40 text-lg leading-none text-ivory backdrop-blur-sm transition hover:bg-ink/60"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div ref={bodyRef} className="modal-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {step === "thanks" ? (
              <div className="text-center">
                <h2 className="font-display text-3xl font-light text-wine sm:text-4xl">Thank You</h2>
                <div className="mx-auto my-4 h-px w-12 bg-gradient-to-r from-transparent via-gold to-transparent" />
                <p className="font-display text-xl font-light italic text-terracotta">Dear {guestName.trim()},</p>
                <p className="mt-4 text-base font-light leading-relaxed text-ink">{thankYouMessage}</p>
                <p className="mt-3 text-sm text-ink-light">This gift is now marked as claimed on the registry.</p>
              </div>
            ) : step === "confirm" ? (
              <>
                <p id="modal-gift-name" className="font-display text-xl font-medium text-ink sm:text-2xl">
                  Almost there
                </p>

                {paymentMethod === "revolut" && revolutInfo ? (
                  <div className="mt-3 rounded-sm border border-wine/20 bg-white px-4 py-4 text-center">
                    <p className="text-sm leading-relaxed text-ink-muted">Please send exactly</p>
                    <p className="mt-1 font-display text-3xl font-light text-wine">
                      €{revolutInfo.amount.toFixed(revolutInfo.amount % 1 === 0 ? 0 : 2)}
                    </p>
                    <p className="mt-2 text-sm text-ink-muted">
                      to <span className="font-medium text-ink">@{revolutInfo.username}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <CopyChip value={revolutInfo.amount.toFixed(2)} label="Copy amount" />
                      <CopyChip value={revolutInfo.reference} label="Copy reference" />
                    </div>
                    <a
                      href={revolutInfo.profileUrl || `https://revolut.me/${revolutInfo.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2"
                    >
                      Open Revolut
                    </a>
                    <p className="mt-3 text-xs leading-relaxed text-ink-light">
                      Revolut opens on our profile — enter the amount above and paste the
                      reference in the note.{" "}
                      <a
                        href={revolutInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 transition hover:text-wine"
                      >
                        Or try the link with €
                        {revolutInfo.amount.toFixed(revolutInfo.amount % 1 === 0 ? 0 : 2)} already
                        filled in
                      </a>
                      .
                    </p>
                  </div>
                ) : (
                  bankInfo && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm leading-relaxed text-ink-muted">
                        Copy these details into your bank app to send the transfer.
                      </p>
                      <CopyDetailRow label="Account name" value={bankInfo.accountName} />
                      <CopyDetailRow
                        label="IBAN"
                        value={bankInfo.ibanDisplay}
                        copyValue={bankInfo.iban}
                      />
                      <CopyDetailRow label="BIC / SWIFT" value={bankInfo.bic} />
                      <CopyDetailRow
                        label="Amount"
                        value={`€${bankInfo.amount.toFixed(2)} EUR`}
                        copyValue={bankInfo.amount.toFixed(2)}
                      />
                      <CopyDetailRow label="Reference" value={bankInfo.reference} />
                    </div>
                  )
                )}

                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  Once you&apos;ve paid, tap the button below so we can mark
                  &ldquo;{gift.name}&rdquo; as yours.
                </p>
                {claimError && <p className="mt-2 text-sm text-wine-light">{claimError}</p>}
              </>
            ) : (
              <>
                <p id="modal-gift-name" className="font-display text-xl font-medium leading-snug text-ink sm:text-2xl">
                  {gift.name}
                </p>
                <p className="mt-1 font-display text-xl font-light text-wine">€{gift.price} EUR</p>
                <div className="gold-rule my-4" />
                <label htmlFor="guest-name" className="mb-2 block text-xs uppercase tracking-wide text-ink-muted">
                  Your Name
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (nameError) setNameError(false);
                  }}
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="w-full rounded-sm border border-ivory-warm bg-white px-4 py-3 text-base outline-none transition focus:border-wine/40 focus:ring-1 focus:ring-wine/20"
                />
                {nameError && (
                  <p className="mt-2 text-sm text-wine-light">Please enter your name so we know who to thank.</p>
                )}

                <p className="mb-2 mt-4 text-xs uppercase tracking-wide text-ink-muted">Payment method</p>
                <div className="space-y-2">
                  {paymentOptions.map((option) => {
                    const selected = paymentMethod === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPaymentMethod(option.id)}
                        className={`w-full rounded-sm border px-3 py-2.5 text-left transition ${
                          selected
                            ? "border-wine/40 bg-white ring-1 ring-wine/20"
                            : "border-ivory-warm bg-white/70 hover:border-wine/20"
                        }`}
                      >
                        <span className="flex items-center gap-2 font-medium text-ink">
                          {option.id === "revolut" && <RevolutIcon />}
                          {option.id === "bank" && <BankIcon />}
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-light">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {claimError && <p className="mt-3 text-sm text-wine-light">{claimError}</p>}
              </>
            )}
          </div>

          <div className="shrink-0 border-t border-ivory-warm bg-ivory px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {step === "thanks" ? (
              <button type="button" onClick={onClose} className="btn-primary w-full">
                Back to Registry
              </button>
            ) : step === "confirm" ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? "Confirming…" : `I've sent €${gift.price} — mark as claimed`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setClaimError("");
                    setRevolutInfo(null);
                    setBankInfo(null);
                  }}
                  className="btn-secondary w-full"
                >
                  Back
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button type="button" onClick={handleContinue} disabled={loading} className="btn-primary w-full">
                  {loading ? "Please wait…" : "Continue"}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary w-full">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyDetailRow({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: string;
  copyValue?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="rounded-sm border border-ivory-warm bg-ivory/60 p-4">
      <p className="text-xs uppercase tracking-wide text-ink-light">{label}</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="font-display text-lg font-light text-ink">{value}</p>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-sm border border-ivory-warm bg-white px-3 py-1.5 text-xs uppercase tracking-wide text-ink-muted transition hover:border-wine/30 hover:text-wine"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function CopyChip({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-sm border border-ivory-warm bg-ivory/60 px-3 py-1.5 text-xs uppercase tracking-wide text-ink-muted transition hover:border-wine/30 hover:text-wine"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function RevolutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 16V8h3.2c2 0 3.2 1.1 3.2 2.8 0 1.7-1.2 2.8-3.2 2.8H8z" fill="currentColor" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10h16M6 10V18M10 10V18M14 10V18M18 10V18M3 18h18M12 4l9 4H3l9-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
