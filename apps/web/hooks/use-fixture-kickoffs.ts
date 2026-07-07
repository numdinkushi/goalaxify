"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";

import { api } from "@goalaxify/convex/_generated/api";
import { isConvexConfigured } from "@/lib/env/runtime";

export function useFixtureKickoffs() {
  const enabled = isConvexConfigured();
  const fixtures = useQuery(api.fixtures.listFixtures, enabled ? {} : "skip");

  const kickoffByFixtureId = useMemo(() => {
    const map = new Map<number, { kickoffAt?: string; round?: string; status?: string }>();

    for (const fixture of fixtures ?? []) {
      map.set(fixture.fixtureId, {
        kickoffAt: fixture.kickoffAt,
        round: fixture.round,
        status: fixture.status,
      });
    }

    return map;
  }, [fixtures]);

  return {
    kickoffByFixtureId,
    loading: enabled && fixtures === undefined,
  };
}
