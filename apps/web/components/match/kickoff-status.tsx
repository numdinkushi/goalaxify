"use client";

import { useEffect, useState } from "react";

import { MatchStatus } from "@/lib/enums";
import { countdown, formatKickoffTime } from "@/lib/utils/format";
import { isMatchLive } from "@/lib/utils/match";

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

  const kickoffMs = Date.parse(kickoffAt);
  const hasStarted = now >= kickoffMs;
  const live = isMatchLive(status);

  let label = formatKickoffTime(kickoffAt);
  if (live) {
    label = status === MatchStatus.Halftime ? "Halftime" : "Live now";
  } else if (!hasStarted) {
    label = `Starts in ${countdown(kickoffMs, now)}`;
  } else if (status === MatchStatus.Finished) {
    label = "Full time";
  } else {
    label = "Kicked off";
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      {live && <span className="live-dot" aria-hidden />}
      {label}
    </span>
  );
}
