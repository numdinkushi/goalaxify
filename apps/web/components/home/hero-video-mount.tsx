"use client";

import { useEffect, useRef } from "react";

type HeroVideoMountProps = {
  videoSrc: string;
  posterSrc: string;
};

function prepareVideoForAutoplay(video: HTMLVideoElement) {
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
}

export function HeroVideoMount({ videoSrc, posterSrc }: HeroVideoMountProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const video = document.createElement("video");
    video.className =
      "absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500";
    video.autoplay = true;
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.poster = posterSrc;
    video.setAttribute("aria-hidden", "true");
    video.tabIndex = -1;
    prepareVideoForAutoplay(video);

    const source = document.createElement("source");
    source.src = videoSrc;
    source.type = "video/mp4";
    video.appendChild(source);

    const revealVideo = () => {
      video.classList.remove("opacity-0");
      video.classList.add("opacity-100");
    };

    video.addEventListener("loadeddata", revealVideo, { once: true });

    host.appendChild(video);

    void video.play().then(() => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        revealVideo();
      }
    }).catch(() => {
      // Poster remains visible underneath.
    });

    return () => {
      video.pause();
      video.remove();
    };
  }, [posterSrc, videoSrc]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0"
      aria-hidden
      suppressHydrationWarning
    />
  );
}
