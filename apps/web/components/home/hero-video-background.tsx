import type { ReactNode } from "react";

import { HeroVideoMount } from "@/components/home/hero-video-mount";
import { cn } from "@/lib/utils";

const DEFAULT_HERO_VIDEO = "/assets/video/goals.mp4";
const DEFAULT_HERO_POSTER = "/assets/video/poster.jpg";

type HeroVideoBackgroundProps = {
  children: ReactNode;
  videoSrc?: string;
  posterSrc?: string;
  className?: string;
};

export function HeroVideoBackground({
  children,
  videoSrc = DEFAULT_HERO_VIDEO,
  posterSrc = DEFAULT_HERO_POSTER,
  className,
}: HeroVideoBackgroundProps) {
  return (
    <section
      className={cn(
        "relative isolate mx-6 mt-5 overflow-hidden rounded-2xl border border-border/80 goalaxify-card-shadow",
        "min-h-[44vh] sm:min-h-[50vh] md:min-h-[56vh]",
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-brand-blush via-brand-white to-brand-cream bg-cover bg-center"
        style={{ backgroundImage: `url(${posterSrc})` }}
        aria-hidden
      />

      <HeroVideoMount videoSrc={videoSrc} posterSrc={posterSrc} />

      <div
        className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/55 to-background/95"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-brand-coral/10"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[inherit] flex-col items-center justify-center px-6 py-10 text-center sm:px-8 sm:py-12">
        {children}
      </div>
    </section>
  );
}
