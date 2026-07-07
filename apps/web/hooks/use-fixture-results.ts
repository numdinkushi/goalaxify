"use client";

import { useEffect, useMemo, useState } from "react";

import type { FixtureResultView } from "@/lib/data/txline/fetch-fixture-result";
import { MatchStatus } from "@/lib/enums";

export type FixtureResultMeta = {
  kickoffAt?: string;
  round?: string;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  winningSelection?: string;
};

export function useFixtureResults(fixtureIds: number[]) {
  const [results, setResults] = useState<FixtureResultView[]>([]);
  const [loading, setLoading] = useState(fixtureIds.length > 0);

  const stableKey = useMemo(
    () => [...new Set(fixtureIds)].sort((a, b) => a - b).join(","),
    [fixtureIds],
  );

  useEffect(() => {
    if (!stableKey) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const response = await fetch("/api/fixtures/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fixtureIds: stableKey.split(",").map(Number),
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          results?: FixtureResultView[];
        };

        if (!cancelled && payload.ok && payload.results) {
          setResults(payload.results);
        }
      } catch {
        // Best-effort enrichment for bet cards.
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stableKey]);

  const resultByFixtureId = useMemo(() => {
    const map = new Map<number, FixtureResultMeta>();
    for (const result of results) {
      map.set(result.fixtureId, {
        kickoffAt: result.kickoffAt,
        round: result.round,
        status: result.status,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        winningSelection: result.winningSelection,
      });
    }
    return map;
  }, [results]);

  return {
    resultByFixtureId,
    loading,
  };
}

export function mergeFixtureMeta(
  kickoffMeta?: FixtureResultMeta,
  resultMeta?: FixtureResultMeta,
): FixtureResultMeta {
  return {
    kickoffAt: kickoffMeta?.kickoffAt ?? resultMeta?.kickoffAt,
    round: kickoffMeta?.round ?? resultMeta?.round,
    status: resultMeta?.status ?? kickoffMeta?.status,
    homeScore: resultMeta?.homeScore,
    awayScore: resultMeta?.awayScore,
    winningSelection: resultMeta?.winningSelection,
  };
}

export function isFixtureFinished(meta?: FixtureResultMeta): boolean {
  return meta?.status === MatchStatus.Finished;
}
