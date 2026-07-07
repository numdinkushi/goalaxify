import type { BoothContext, FeaturedMatchView } from "@/lib/data/types";

export function matchToBoothContext(match: FeaturedMatchView): BoothContext {
  return {
    fixtureId: match.fixtureId,
    ref: match.ref,
    homeTeam: match.home.name,
    awayTeam: match.away.name,
    homeFlag: match.home.flag,
    awayFlag: match.away.flag,
    round: match.round,
    kickoffAt: match.kickoffAt,
    market: "match_winner",
    odds: match.market,
  };
}

export function buildBoothHref(fixtureId: number): string {
  return `/booth?fixture=${fixtureId}`;
}

export function resolveInitialFixtureId(
  matches: FeaturedMatchView[],
  requestedFixtureId?: number,
): number {
  if (requestedFixtureId) {
    const match = matches.find(
      (entry) => entry.fixtureId === requestedFixtureId,
    );
    if (match) return match.fixtureId;
  }

  return matches[0]?.fixtureId ?? 0;
}
