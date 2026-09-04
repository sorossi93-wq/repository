import Image from "next/image";
import type { Gift, SoldOutEntry } from "@/lib/types";

interface GiftCardProps {
  gift: Gift;
  soldOut?: SoldOutEntry;
  onGiftClick: (gift: Gift) => void;
}

export function GiftCard({ gift, soldOut, onGiftClick }: GiftCardProps) {
  const isSold = Boolean(soldOut);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-card bg-white shadow-card transition duration-500 ${
        isSold ? "" : "hover:-translate-y-1 hover:shadow-card-hover"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={gift.image}
          alt={gift.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition duration-700 ${
            isSold ? "grayscale-[40%] brightness-90" : "group-hover:scale-105"
          }`}
        />
        <div
          className={`absolute inset-0 transition duration-500 ${
            isSold
              ? "bg-ink/50"
              : "bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-60 group-hover:from-wine/40"
          }`}
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border border-ivory/40 bg-ink/60 px-6 py-3 text-center backdrop-blur-sm">
              <p className="font-display text-sm uppercase tracking-editorial text-ivory">Already gifted</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col p-6">
        <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">{gift.name}</h3>
        <p className="mt-2 flex-grow text-sm leading-relaxed text-ink-muted">{gift.description}</p>
        <div className="gold-rule my-5" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-display text-2xl font-light text-wine">€{gift.price}</span>
          {isSold ? (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-sm border border-ivory-warm px-5 py-2.5 text-sm font-medium tracking-wide text-ink-light"
            >
              Already gifted
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onGiftClick(gift)}
              className="rounded-sm border border-wine px-5 py-2.5 text-sm font-medium tracking-wide text-wine transition duration-300 hover:bg-wine hover:text-ivory"
            >
              Gift this
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
