"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { findGiftById, getDefaultThankYou } from "@/data/gifts";
import { getBankTransferDetails, type BankTransferDetails } from "@/lib/bank";
import { formatBankIbanDisplay, siteConfig } from "@/lib/config";
import type { Gift } from "@/lib/types";

type PaymentMethod = "paypal" | "revolut" | "bank";
type Step = "form" | "confirm" | "thanks";

interface RevolutPaymentInfo {
  url: string;
  amount: number;
  username: string;
  reference: string;
}

interface GiftModalProps {
  gift: Gift | null;
  onClose: () => void;
  onClaimed?: () => void;
}

const paymentOptions: {
  id: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    id: "paypal",
    label: "PayPal",
    description: "Redirect to PayPal — we mark your gift automatically when you return.",
  },
  {
    id: "revolut",
    label: "Revolut",
    description: "One tap opens Revolut with amount pre-filled — then confirm here.",
  },
  {
    id: "bank",
    label: "Bank transfer",
    description: "Copy IBAN, amount and reference into your bank app — then confirm here.",
  },
];

export function GiftModal({ gift, onClose, onClaimed }: GiftModalProps) {
  const [guestName, setGuestName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paypal");
  const [step, setStep] = useState<Step>("form");
  const [nameError, setNameError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [revolutInfo, setRevolutInfo] = useState<RevolutPaymentInfo | null>(null);
  const [bankInfo, setBankInfo] = useState<BankTransferDetails | null>(null);

  useEffect(() => {
    if (gift) {
      setGuestName("");
      setPaymentMethod("paypal");
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
      if (paymentMethod === "paypal") {
        const res = await fetch("/api/paypal-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            giftId: gift!.id,
            giftName: gift!.name,
            guestName: name,
            amount: gift!.price,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to build PayPal URL");
        }

        const { url } = await res.json();
        try {
          sessionStorage.setItem(
            "pendingClaim",
            JSON.stringify({ giftId: gift!.id, guestName: name })
          );
        } catch {
          /* private browsing */
        }
        window.location.href = url;
        return;
      }

      if (paymentMethod === "revolut") {
        const res = await fetch("/api/revolut-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId: gift!.id, guestName: name }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to build Revolut URL");
        }

        const data = await res.json();
        setRevolutInfo(data);
        setStep("confirm");
        return;
      }

      setBankInfo(
        getBankTransferDetails(gift!.price, gift!.name, name, formatBankIbanDisplay())
      );
      setStep("confirm");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: gift!.id,
          giftedBy: name,
          giftName: gift!.name,
          amount: gift!.price,
          paymentMethod,
        }),
      });

      if (res.status === 409) {
        setClaimError("This gift was just claimed by someone else. Thank you anyway — please contact us if you sent a payment.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to confirm your gift");
      }

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-gift-name"
    >
      <div
        className="animate-modal-in relative w-full max-w-md overflow-hidden rounded-card-lg bg-ivory shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] w-full">
          <Image src={gift.image} alt={gift.name} fill sizes="448px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-ink/40 text-lg leading-none text-ivory backdrop-blur-sm transition hover:bg-ink/60"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="p-8">
          {step === "thanks" ? (
            <div className="text-center">
              <h2 className="font-display text-4xl font-light text-wine">Thank You</h2>
              <div className="mx-auto my-5 h-px w-12 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <p className="font-display text-xl font-light italic text-terracotta">Dear {guestName.trim()},</p>
              <p className="mt-6 text-base font-light leading-relaxed text-ink">{thankYouMessage}</p>
              <p className="mt-4 text-sm text-ink-light">This gift is now marked as claimed on the registry.</p>
              <button type="button" onClick={onClose} className="btn-primary mt-8 w-full">
                Back to Registry
              </button>
            </div>
          ) : step === "confirm" ? (
            <>
              <p id="modal-gift-name" className="font-display text-2xl font-medium text-ink">
                Almost there
              </p>

              {paymentMethod === "revolut" && revolutInfo ? (
                <div className="mt-4 rounded-sm border border-wine/20 bg-white px-5 py-5 text-center">
                  <p className="text-sm leading-relaxed text-ink-muted">
                    Please send exactly
                  </p>
                  <p className="mt-1 font-display text-3xl font-light text-wine">
                    €{revolutInfo.amount.toFixed(revolutInfo.amount % 1 === 0 ? 0 : 2)}
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">
                    to <span className="font-medium text-ink">@{revolutInfo.username}</span>
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <CopyChip
                      value={revolutInfo.amount.toFixed(2)}
                      label="Copy amount"
                    />
                    <CopyChip
                      value={revolutInfo.reference}
                      label="Copy reference"
                    />
                  </div>
                  <a
                    href={revolutInfo.url}
                    className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2"
                  >
                    Open Revolut to pay €
                    {revolutInfo.amount.toFixed(revolutInfo.amount % 1 === 0 ? 0 : 2)}
                  </a>
                  <p className="mt-4 text-xs leading-relaxed text-ink-light">
                    Tap the button above to open Revolut with the amount pre-filled. If it
                    wasn&apos;t, use the copy buttons above.
                  </p>
                </div>
              ) : paymentMethod === "bank" && bankInfo ? (
                <div className="mt-4 space-y-3">
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
              ) : null}

              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                Once you&apos;ve completed the payment, tap the button below so we can mark
                &ldquo;{gift.name}&rdquo; as yours.
              </p>

              <div className="gold-rule my-6" />

              {claimError && <p className="text-sm text-wine-light">{claimError}</p>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="btn-primary flex-1"
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
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
              </div>
            </>
          ) : (
            <>
              <p id="modal-gift-name" className="font-display text-2xl font-medium text-ink">
                {gift.name}
              </p>
              <p className="mt-1 font-display text-xl font-light text-wine">€{gift.price} EUR</p>

              <div className="gold-rule my-6" />

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

              <p className="mb-3 mt-6 text-xs uppercase tracking-wide text-ink-muted">Payment method</p>
              <div className="space-y-2">
                {paymentOptions.map((option) => {
                  const selected = paymentMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPaymentMethod(option.id)}
                      className={`w-full rounded-sm border px-4 py-3 text-left transition ${
                        selected
                          ? "border-wine/40 bg-white ring-1 ring-wine/20"
                          : "border-ivory-warm bg-white/70 hover:border-wine/20"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-medium text-ink">
                        {option.id === "paypal" && <PayPalIcon />}
                        {option.id === "revolut" && <RevolutIcon />}
                        {option.id === "bank" && <BankIcon />}
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-ink-light">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={handleContinue} disabled={loading} className="btn-primary flex-1">
                  {loading
                    ? "Please wait…"
                    : paymentMethod === "paypal"
                      ? "Continue to PayPal"
                      : paymentMethod === "revolut"
                        ? "Continue"
                        : "Continue"}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
              <p className="mt-5 text-center text-xs leading-relaxed text-ink-light">
                {paymentMethod === "paypal"
                  ? "You'll be redirected to PayPal with the amount pre-filled. Your gift note will include the item name and your name."
                  : paymentMethod === "revolut"
                    ? "Tap once to open Revolut with the amount pre-filled, then confirm here."
                    : "Copy IBAN, amount and reference into your bank app, then confirm here."}
              </p>
            </>
          )}
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

function PayPalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.901C5.026 2.396 5.474 2 5.998 2h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
    </svg>
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
