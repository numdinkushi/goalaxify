"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MomentFeed } from "@/components/live/moment-feed";
import type { MomentView } from "@/lib/data/types";
import { formatScoreline } from "@/lib/utils/format";

const POLL_MS = 25_000;

type LiveFeedClientProps = {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  initialMoments: MomentView[];
};

function momentsSignature(moments: MomentView[]): string {
  return moments.map((moment) => moment.id).join("|");
}

export function LiveFeedClient({
  fixtureId,
  homeTeam,
  awayTeam,
  initialMoments,
}: LiveFeedClientProps) {
  const [moments, setMoments] = useState(initialMoments);
  const signatureRef = useRef(momentsSignature(initialMoments));

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/live/moments?fixtureId=${fixtureId}`, {
        cache: "no-store",
      });
      if (!response.ok) return;

      const payload = (await response.json()) as {
        ok: boolean;
        moments?: MomentView[];
      };

      if (!payload.ok || !Array.isArray(payload.moments)) return;

      const nextSignature = momentsSignature(payload.moments);
      if (nextSignature !== signatureRef.current) {
        signatureRef.current = nextSignature;
        setMoments(payload.moments);
      }
    } catch {
      // Keep the last good feed on transient network errors.
    }
  }, [fixtureId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [refresh]);

  const latestScore = moments[0];

  return (
    <div className="space-y-4">
      {latestScore && (
        <div className="rounded-2xl border border-border/80 bg-card/90 px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-pastel-pink uppercase">
            Live score
          </p>
          <p className="mt-1 text-2xl font-bold">
            {homeTeam}{" "}
            <span className="text-brand-coral">
              {formatScoreline(latestScore.homeScore, latestScore.awayScore)}
            </span>{" "}
            {awayTeam}
          </p>
        </div>
      )}

      <MomentFeed moments={moments} homeTeam={homeTeam} awayTeam={awayTeam} />
    </div>
  );
}
