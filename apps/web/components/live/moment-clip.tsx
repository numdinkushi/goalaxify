"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Play } from "lucide-react";

import type { MomentView } from "@/lib/data/types";

const POSTER_URL = "/assets/video/poster.jpg";

type MomentClipProps = {
  clipUrl: string;
  label: string;
};

export function MomentClip({ clipUrl, label }: MomentClipProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handlePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mt-3 overflow-hidden rounded-xl border border-border/70 bg-black/80"
    >
      {isVisible ? (
        <video
          ref={videoRef}
          className="aspect-video w-full object-cover"
          src={clipUrl}
          poster={POSTER_URL}
          preload="none"
          playsInline
          muted
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : (
        <div
          className="aspect-video w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${POSTER_URL})` }}
        />
      )}

      {!isPlaying && (
        <button
          type="button"
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/35 transition hover:bg-black/45"
          aria-label={`Play ${label}`}
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}

export type { MomentView };
