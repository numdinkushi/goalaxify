"use client";

import { useEffect, useState } from "react";

import { MatchStatus } from "@/lib/enums";
import { countdown, formatKickoffTime } from "@/lib/utils/format";
import {
  deriveMatchStatus,
  hasMatchKickedOff,
  isMatchLive,
} from "@/lib/utils/match";

type KickoffStatusProps = {
  kickoffAt: string;
  status: MatchStatus;
};

export function KickoffStatus({ kickoffAt, status }: KickoffStatusProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const resolvedStatus = deriveMatchStatus(kickoffAt, status, now);
  const kickedOff = hasMatchKickedOff(kickoffAt, now);
  const live = isMatchLive(resolvedStatus) && kickedOff;

  let label = formatKickoffTime(kickoffAt);

  if (!kickedOff) {
    label = countdown(Date.parse(kickoffAt), now);
  } else if (live) {
    label = resolvedStatus === MatchStatus.Halftime ? "Halftime" : "Live now";
  } else if (resolvedStatus === MatchStatus.Finished) {
    label = "Full time";
  } else {
    label = "Kicked off";
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground tabular-nums">
      {live ? <span className="live-dot" aria-hidden /> : null}
      {!kickedOff ? (
        <>
          <span className="font-sans tracking-normal text-muted-foreground">
            Starts in
          </span>
          {label}
        </>
      ) : (
        <span className="font-sans tracking-normal">{label}</span>
      )}
    </span>
  );
}
