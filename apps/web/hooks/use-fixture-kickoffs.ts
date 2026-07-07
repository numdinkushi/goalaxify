"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@goalaxify/convex/_generated/api";
import { isConvexConfigured } from "@/lib/env/runtime";

export type FixtureKickoffMeta = {
  kickoffAt?: string;
  round?: string;
  status?: string;
};

type KickoffApiEntry = FixtureKickoffMeta & {
  fixtureId: number;
  homeTeam?: string;
  awayTeam?: string;
};

export function useFixtureKickoffs() {
  const enabled = isConvexConfigured();
  const fixtures = useQuery(api.fixtures.listFixtures, enabled ? {} : "skip");
  const [apiKickoffs, setApiKickoffs] = useState<KickoffApiEntry[]>([]);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadKickoffs() {
      try {
        const response = await fetch("/api/fixtures/kickoffs");
        const payload = (await response.json()) as {
          ok?: boolean;
          kickoffs?: KickoffApiEntry[];
        };

        if (!cancelled && payload.ok && payload.kickoffs) {
          setApiKickoffs(payload.kickoffs);
        }
      } catch {
        // TxLINE kickoffs are best-effort enrichment.
      } finally {
        if (!cancelled) {
          setApiLoading(false);
        }
      }
    }

    void loadKickoffs();
    return () => {
      cancelled = true;
    };
  }, []);

  const kickoffByFixtureId = useMemo(() => {
    const map = new Map<number, FixtureKickoffMeta>();

    for (const fixture of fixtures ?? []) {
      map.set(fixture.fixtureId, {
        kickoffAt: fixture.kickoffAt,
        round: fixture.round,
        status: fixture.status,
      });
    }

    for (const entry of apiKickoffs) {
      const existing = map.get(entry.fixtureId);
      map.set(entry.fixtureId, {
        kickoffAt: entry.kickoffAt ?? existing?.kickoffAt,
        round: entry.round ?? existing?.round,
        status: entry.status ?? existing?.status,
      });
    }

    return map;
  }, [apiKickoffs, fixtures]);

  const kickoffByTeams = useMemo(() => {
    const map = new Map<string, FixtureKickoffMeta>();
    for (const entry of apiKickoffs) {
      if (!entry.homeTeam || !entry.awayTeam || !entry.kickoffAt) continue;
      const key = `${entry.homeTeam.toLowerCase()}|${entry.awayTeam.toLowerCase()}`;
      map.set(key, {
        kickoffAt: entry.kickoffAt,
        round: entry.round,
        status: entry.status,
      });
    }
    return map;
  }, [apiKickoffs]);

  return {
    kickoffByFixtureId,
    kickoffByTeams,
    loading: enabled && fixtures === undefined && apiLoading,
  };
}

export function resolveFixtureMetaForPrediction(
  prediction: {
    fixtureId: number;
    homeTeam: string;
    awayTeam: string;
    kickoffAt?: string;
    round?: string;
  },
  kickoffByFixtureId: Map<number, FixtureKickoffMeta>,
  kickoffByTeams: Map<string, FixtureKickoffMeta>,
): FixtureKickoffMeta {
  const byId = kickoffByFixtureId.get(prediction.fixtureId);
  const byTeams = kickoffByTeams.get(
    `${prediction.homeTeam.toLowerCase()}|${prediction.awayTeam.toLowerCase()}`,
  );

  return {
    kickoffAt: prediction.kickoffAt ?? byId?.kickoffAt ?? byTeams?.kickoffAt,
    round: prediction.round ?? byId?.round ?? byTeams?.round,
    status: byId?.status ?? byTeams?.status,
  };
}
