"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { giftSections } from "@/data/gifts";
import type { Gift, SoldOutEntry } from "@/lib/types";
import { GiftCard } from "./GiftCard";
import { GiftModal } from "./GiftModal";

export function RegistryPage() {
  const [soldOut, setSoldOut] = useState<SoldOutEntry[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);

  const loadClaims = useCallback(async () => {
    try {
      const res = await fetch("/api/claims");
      if (res.ok) {
        const data = await res.json();
        setSoldOut(data.soldOut ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  function getSoldOutEntry(giftId: string) {
    return soldOut.find((s) => s.giftId === giftId);
  }

  return (
    <>
      {loading && (
        <p className="py-12 text-center text-sm uppercase tracking-wide text-ink-light">Loading gifts…</p>
      )}
      {giftSections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className={`px-6 py-16 md:py-24 ${index % 2 === 1 ? "bg-ivory-dark/50" : ""}`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <div className="relative mx-auto mb-8 h-32 w-32 overflow-hidden rounded-full md:h-40 md:w-40">
                <Image
                  src={section.image}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                <div className="absolute inset-0 rounded-full ring-1 ring-gold/30 ring-offset-4 ring-offset-ivory" />
              </div>
              <p className="text-xs uppercase tracking-editorial text-terracotta">
                {section.id === "honeymoon" && "Adventures"}
                {section.id === "material" && "For the Home"}
                {section.id === "max" && "Future Family"}
              </p>
              <div className="section-divider" />
              <h2 className="section-title">{section.title}</h2>
              <p className="mx-auto mt-4 max-w-xl font-light text-ink-muted">{section.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {section.gifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  soldOut={getSoldOutEntry(gift.id)}
                  onGiftClick={setSelectedGift}
                />
              ))}
            </div>
          </div>
        </section>
      ))}
      <GiftModal gift={selectedGift} onClose={() => setSelectedGift(null)} onClaimed={loadClaims} />
    </>
  );
}
