import type { ThreeWayOdds } from "@goalaxify/domain";

import { teamFromCode } from "@/lib/constants/teams";
import { buildOddsFromDecimals } from "@/lib/utils/odds";
import { MatchStatus } from "@/lib/enums";

export type FixtureCatalogEntry = {
  ref: string;
  fixtureId: number;
  txlineFixtureId?: number;
  home: ReturnType<typeof teamFromCode>;
  away: ReturnType<typeof teamFromCode>;
  venue: string;
  kickoffAt: string;
  round: string;
  status: MatchStatus;
  boothOpen: boolean;
  featured: boolean;
  marketOdds?: ThreeWayOdds;
  crowdOdds?: ThreeWayOdds;
  marketDeltaPct?: number;
};

const featuredMarket = buildOddsFromDecimals(1.61, 3.8, 4.2);
const featuredCrowd = buildOddsFromDecimals(1.45, 4.1, 5.0);

export const FIXTURE_CATALOG: FixtureCatalogEntry[] = [
  {
    ref: "WC2026-R16-BRAMOR",
    fixtureId: 1001,
    home: teamFromCode("BRA"),
    away: teamFromCode("MAR"),
    venue: "Houston",
    kickoffAt: "2026-07-07T20:00:00.000Z",
    round: "Round of 16",
    status: MatchStatus.Scheduled,
    boothOpen: true,
    featured: true,
    marketOdds: featuredMarket,
    crowdOdds: featuredCrowd,
    marketDeltaPct: 4.2,
  },
  {
    ref: "WC2026-QF-FRAJPN",
    fixtureId: 1002,
    home: teamFromCode("FRA"),
    away: teamFromCode("JPN"),
    venue: "Dallas",
    kickoffAt: "2026-07-07T17:00:00.000Z",
    round: "Quarter-final",
    status: MatchStatus.Scheduled,
    boothOpen: false,
    featured: false,
    marketOdds: buildOddsFromDecimals(1.82, 3.4, 4.5),
    crowdOdds: buildOddsFromDecimals(1.9, 3.2, 4.1),
    marketDeltaPct: 1.8,
  },
  {
    ref: "WC2026-QF-ARGNED",
    fixtureId: 1003,
    home: teamFromCode("ARG"),
    away: teamFromCode("NED"),
    venue: "Miami",
    kickoffAt: "2026-07-08T20:00:00.000Z",
    round: "Quarter-final",
    status: MatchStatus.Scheduled,
    boothOpen: false,
    featured: false,
    marketOdds: buildOddsFromDecimals(1.72, 3.6, 4.8),
    crowdOdds: buildOddsFromDecimals(1.65, 3.8, 5.2),
    marketDeltaPct: -0.6,
  },
];

export function getFeaturedFixture(): FixtureCatalogEntry {
  const featured = FIXTURE_CATALOG.find((fixture) => fixture.featured);
  if (!featured) throw new Error("No featured fixture configured");
  return featured;
}

export function getFixtureById(fixtureId: number): FixtureCatalogEntry | undefined {
  return FIXTURE_CATALOG.find((fixture) => fixture.fixtureId === fixtureId);
}
