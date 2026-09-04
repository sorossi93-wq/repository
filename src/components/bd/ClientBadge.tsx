"use client";

import Image from "next/image";
import { clientInitials, getClient } from "@/data/bd/clients";
import type { Client } from "@/lib/bd/types";

interface ClientBadgeProps {
  clientId: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const SIZE = {
  sm: { box: "h-8 w-8 text-xs", img: 32, name: "text-xs" },
  md: { box: "h-10 w-10 text-sm", img: 40, name: "text-sm" },
  lg: { box: "h-14 w-14 text-base", img: 56, name: "text-base font-semibold" },
};

export function ClientBadge({ clientId, size = "md", showName = true, className = "" }: ClientBadgeProps) {
  const client = getClient(clientId);
  if (!client) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
          ??
        </span>
        {showName && <span className="text-sm text-slate-600">Unknown client</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ClientAvatar client={client} size={size} />
      {showName && (
        <span className={`${SIZE[size].name} text-slate-800`}>{client.name}</span>
      )}
    </span>
  );
}

function ClientAvatar({ client, size }: { client: Client; size: "sm" | "md" | "lg" }) {
  const s = SIZE[size];
  const initials = clientInitials(client.name);

  if (client.logo && (client.logo.endsWith(".png") || client.logo.endsWith(".jpeg") || client.logo.endsWith(".jpg"))) {
    return (
      <span
        className={`relative ${s.box} shrink-0 overflow-hidden rounded-xl border-2 bg-white shadow-sm`}
        style={{ borderColor: `${client.accent}40` }}
      >
        <Image
          src={client.logo}
          alt={client.name}
          width={s.img}
          height={s.img}
          className="h-full w-full object-contain p-1"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={`flex ${s.box} shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm`}
      style={{
        background: `linear-gradient(135deg, ${client.accent}, ${client.accent}cc)`,
      }}
      title={client.name}
    >
      {initials}
    </span>
  );
}

export function ClientMarquee() {
  const featured = [
    "equinor", "aker-bp", "shell-no", "bp", "harbour", "ithaca",
    "eni", "total", "ineos", "conoco", "repsol", "var",
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 py-3">
      <div className="animate-marquee flex gap-8 whitespace-nowrap px-4">
        {[...featured, ...featured].map((id, i) => (
          <ClientBadge key={`${id}-${i}`} clientId={id} size="sm" showName />
        ))}
      </div>
    </div>
  );
}
