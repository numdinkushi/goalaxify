"use client";

import { useSyncExternalStore } from "react";

import { MatchStatus } from "@/lib/enums";
import { countdown, formatKickoffTime } from "@/lib/utils/format";
import { hasMatchKickedOff, isMatchLive } from "@/lib/utils/match";

type KickoffStatusProps = {
  kickoffAt: string;
  status: MatchStatus;
};

let cachedNow = 0;
let intervalId: number | undefined;
const listeners = new Set<() => void>();

function tickNow() {
  cachedNow = Date.now();
  for (const listener of listeners) {
    listener();
  }
}

function subscribeToNow(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  if (listeners.size === 1) {
    cachedNow = Date.now();
    intervalId = window.setInterval(tickNow, 1000);
  }

  return () => {
    listeners.delete(onStoreChange);

    if (listeners.size === 0 && intervalId !== undefined) {
      window.clearInterval(intervalId);
      intervalId = undefined;
    }
  };
}

function getClientNow() {
  if (cachedNow === 0) {
    cachedNow = Date.now();
  }

  return cachedNow;
}

function getServerNow() {
  return null;
}

function KickoffStatusShell({
  live,
  upcoming,
  label,
}: {
  live: boolean;
  upcoming: boolean;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground tabular-nums">
      {live ? <span className="live-dot" aria-hidden /> : null}
      {upcoming ? (
        <>
          <span className="font-sans tracking-normal text-muted-foreground">
            Starts in
          </span> 
          <span suppressHydrationWarning>{label}</span>
        </>
      ) : (
        <span className="font-sans tracking-normal" suppressHydrationWarning>
          {label}
        </span>
      )}
    </span>
  );
}

export function KickoffStatus({ kickoffAt, status }: KickoffStatusProps) {
  const now = useSyncExternalStore(
    subscribeToNow,
    getClientNow,
    getServerNow,
  );

  const live = isMatchLive(status);
  const upcoming = status === MatchStatus.Scheduled;
  const ended = status === MatchStatus.Finished;

  let label = formatKickoffTime(kickoffAt);
  if (live) {
    label = status === MatchStatus.Halftime ? "Halftime" : "Live now";
  } else if (ended) {
    label = "Full time";
  } else if (upcoming && now !== null) {
    label = hasMatchKickedOff(kickoffAt, now)
      ? "Kicked off"
      : countdown(Date.parse(kickoffAt), now);
  }

  return (
    <KickoffStatusShell live={live} upcoming={upcoming} label={label} />
  );
}
