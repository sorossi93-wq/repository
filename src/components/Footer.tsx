import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-ivory-warm px-6 py-16 text-center">
      <div className="mx-auto mb-6 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
      <p className="font-display text-2xl font-light text-wine">{siteConfig.couple.names}</p>
      <p className="mt-3 font-light text-ink-muted">With love and gratitude</p>
      <p className="mt-8 text-sm font-light text-ink-light">
        No login needed — just pick a gift and pay via PayPal in EUR.
      </p>
    </footer>
  );
}
