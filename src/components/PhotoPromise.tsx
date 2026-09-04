import { siteConfig } from "@/lib/config";

export function PhotoPromise() {
  return (
    <section className="relative px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-editorial text-terracotta">A small promise</p>
        <div className="section-divider" />
        <h2 className="font-display text-3xl font-light text-ink md:text-4xl">We&apos;ll Send You Photos</h2>
        <p className="mt-6 text-base font-light leading-relaxed text-ink-muted md:text-lg">
          {siteConfig.messages.photoPromise}
        </p>
        <div className="mx-auto mt-8 flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-gold/40" />
          <div className="h-1.5 w-1.5 rotate-45 border border-gold/60" />
          <div className="h-px w-12 bg-gold/40" />
        </div>
      </div>
    </section>
  );
}
