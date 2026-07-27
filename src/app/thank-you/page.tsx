"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { findGiftById, getDefaultThankYou } from "@/data/gifts";
import { siteConfig } from "@/lib/config";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const giftId = searchParams.get("gift") || searchParams.get("giftId") || "";
  const guestName = searchParams.get("name") || searchParams.get("guest") || "";

  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    async function init() {
      let resolvedGiftId = giftId;
      let resolvedGuestName = guestName;

      if (!resolvedGiftId || !resolvedGuestName) {
        try {
          const pending = sessionStorage.getItem("pendingClaim");
          if (pending) {
            const parsed = JSON.parse(pending) as { giftId?: string; guestName?: string };
            resolvedGiftId = resolvedGiftId || parsed.giftId || "";
            resolvedGuestName = resolvedGuestName || parsed.guestName || "";
          }
        } catch {
          /* ignore */
        }
      }

      const found = resolvedGiftId ? findGiftById(resolvedGiftId) : null;
      const nameForDisplay = resolvedGuestName || "Friend";
      setDisplayName(resolvedGuestName);

      if (found) {
        setImage(found.gift.image);
        setMessage(
          found.gift.thankYou ||
            getDefaultThankYou(resolvedGiftId, found.section.id, found.gift.name)
        );
      } else if (resolvedGuestName) {
        setMessage(
          `Your generosity has touched our hearts beyond words, ${nameForDisplay}. We are so grateful you are part of our journey, and we can't wait to celebrate with you on ${siteConfig.couple.date}!`
        );
      } else {
        setMessage(
          "Thank you for visiting our registry! We are so grateful for your love and support as we begin this new chapter together."
        );
      }

      if (resolvedGiftId && resolvedGuestName) {
        try {
          const res = await fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              giftId: resolvedGiftId,
              giftedBy: resolvedGuestName,
              paymentMethod: "paypal",
            }),
          });
          if (res.ok || res.status === 409) {
            setClaimed(true);
            try {
              sessionStorage.removeItem("pendingClaim");
            } catch {
              /* ignore */
            }
          }
        } catch {
          /* guest still sees thank you */
        }
      }
    }
    init();
  }, [giftId, guestName]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6 py-16">
      <div className="animate-modal-in w-full max-w-lg overflow-hidden rounded-card-lg bg-white shadow-modal">
        {image && (
          <div className="relative aspect-[16/9] w-full">
            <Image src={image} alt="" fill sizes="512px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          </div>
        )}
        <div className="p-10 text-center">
          <h1 className="font-display text-5xl font-light text-wine">Thank You</h1>
          <div className="mx-auto my-5 h-px w-12 bg-gradient-to-r from-transparent via-gold to-transparent" />
          {displayName && (
            <p className="font-display text-xl font-light italic text-terracotta">Dear {displayName},</p>
          )}
          <p className="mt-6 text-lg font-light leading-relaxed text-ink">{message}</p>
          {claimed && (giftId || displayName) && (
            <p className="mt-4 text-sm text-ink-light">This gift is now marked as claimed on the registry.</p>
          )}
          <Link href="/" className="btn-primary mt-8 inline-flex">
            Back to Registry
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-ivory">
          <p className="text-sm uppercase tracking-wide text-ink-light">Loading…</p>
        </main>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
