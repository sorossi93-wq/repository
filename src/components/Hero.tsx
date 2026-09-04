import Image from "next/image";
import { siteConfig } from "@/lib/config";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1760681557484-d49c62cd3e8b?auto=format&fit=crop&w=1920&q=80";

export function Hero() {
  return (
    <header className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt="Vineyard in the Italian countryside"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-wine-dark/60 to-ink/70" />

      <div className="relative z-10 px-6 py-20 text-center text-ivory">
        <p className="animate-hero-reveal mb-6 text-xs uppercase tracking-editorial text-gold-light">
          Wedding Registry
        </p>
        <h1 className="animate-hero-reveal-delay font-display text-5xl font-light leading-tight md:text-7xl lg:text-8xl">
          {siteConfig.couple.names}
        </h1>
        <div className="animate-hero-reveal-delay mx-auto my-8 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p className="animate-hero-reveal-delay font-display text-xl font-light tracking-wide text-ivory/90 md:text-2xl">
          {siteConfig.couple.date}
        </p>
        <p className="animate-hero-reveal-delay-2 mx-auto mt-10 max-w-xl text-base font-light leading-relaxed text-ivory/80 md:text-lg">
          {siteConfig.messages.heroSubtitle}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ivory to-transparent" />
    </header>
  );
}
