"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_HERO_VIDEO = "/assets/video/goals.mp4";

type HeroVideoBackgroundProps = {
  children: ReactNode;
  videoSrc?: string;
  className?: string;
};

export function HeroVideoBackground({
  children,
  videoSrc = DEFAULT_HERO_VIDEO,
  className,
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setReduceMotion(mediaQuery.matches);

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);

    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    const playVideo = async () => {
      try {
        await video.play();
      } catch {
        // Autoplay can be blocked; poster/overlay still renders.
      }
    };

    void playVideo();
  }, [reduceMotion, videoSrc]);

  return (
    <section
      className={cn(
        "relative isolate mx-6 mt-5 overflow-hidden rounded-2xl border border-border/80 goalaxify-card-shadow",
        "min-h-[44vh] sm:min-h-[50vh] md:min-h-[56vh]",
        className,
      )}
    >
      {!reduceMotion ? (
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-brand-blush via-brand-white to-brand-cream"
          aria-hidden
        />
      )}

      {/* Readability overlays */}
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
