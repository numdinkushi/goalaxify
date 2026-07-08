import "server-only";

import { TxlineClient } from "@goalaxify/txline-sdk/client";

import type { FixtureCatalogEntry } from "@/lib/constants/fixtures";
import { getBoothStatusLabel } from "@/lib/constants/match-copy";
import type { FeaturedMatchView } from "@/lib/data/types";
import { getTxlineCredentials } from "@/lib/data/txline/credentials";
import { mapTxlineOddsSnapshot } from "@/lib/data/txline/map-odds";
import {
  listUpcomingTxlineFixtures,
  mapTxlineFixturesSnapshot,
  txlineFixtureToCatalogEntry,
} from "@/lib/data/txline/map-fixtures";
import { mapTxlineScoresStatus } from "@/lib/data/txline/map-scores";
import { OddsSource } from "@/lib/enums";
import { getRequestSettlementNetwork } from "@/lib/solana/network-server";
import {
  deriveMatchStatus,
  findLiveMatch,
  isBoothOpenForMatch,
} from "@/lib/utils/match";

function catalogToMatchView(
  fixture: FixtureCatalogEntry,
  oddsSource: OddsSource,
): FeaturedMatchView {
  if (!fixture.marketOdds) {
    throw new Error("Cannot render match view without live market odds");
  }

  const status = deriveMatchStatus(fixture.kickoffAt, fixture.status);
  const boothOpen = isBoothOpenForMatch(fixture.kickoffAt, status);

  return {
    ref: fixture.ref,
    fixtureId: fixture.fixtureId,
    home: fixture.home,
    away: fixture.away,
    venue: fixture.venue,
    kickoffAt: fixture.kickoffAt,
    status,
    round: fixture.round,
    boothOpen,
    boothStatusLabel: getBoothStatusLabel(boothOpen),
    market: fixture.marketOdds,
    crowd: fixture.crowdOdds ?? null,
    marketDeltaPct: null,
    oddsSource,
  };
}

async function hydrateFixtureFromTxline(
  fixture: FixtureCatalogEntry,
  client: TxlineClient,
): Promise<FeaturedMatchView | null> {
  const fixtureId = fixture.txlineFixtureId;
  if (!fixtureId) {
    return null;
  }

  try {
    const [oddsSnapshot, scoresSnapshot] = await Promise.all([
      client.getOddsSnapshot(fixtureId),
      client.getScoresSnapshot(fixtureId).catch(() => null),
    ]);

    const mappedOdds = mapTxlineOddsSnapshot(oddsSnapshot);
    if (!mappedOdds) {
      return null;
    }

    const workingFixture = { ...fixture, marketOdds: mappedOdds };

    const scoresStatus = mapTxlineScoresStatus(
      scoresSnapshot,
      workingFixture.kickoffAt,
    );

    if (scoresStatus) {
      workingFixture.status = deriveMatchStatus(
        workingFixture.kickoffAt,
        scoresStatus,
      );
    }

    return catalogToMatchView(workingFixture, OddsSource.Txline);
  } catch {
    return null;
  }
}

export async function fetchUpcomingMatches(): Promise<FeaturedMatchView[]> {
  const network = await getRequestSettlementNetwork();
  const credentials = getTxlineCredentials(network);
  if (!credentials) {
    return [];
  }

  const client = new TxlineClient({
    credentials,
    network,
  });

  try {
    const fixturesSnapshot = await client.listFixtures();
    const fixtures = mapTxlineFixturesSnapshot(fixturesSnapshot);
    const upcoming = listUpcomingTxlineFixtures(fixtures);

    if (upcoming.length === 0) {
      return [];
    }

    const catalogEntries = upcoming.map(txlineFixtureToCatalogEntry);
    const hydrated = await Promise.all(
      catalogEntries.map((entry) => hydrateFixtureFromTxline(entry, client)),
    );

    return hydrated.filter(
      (match): match is FeaturedMatchView => match !== null,
    );
  } catch {
    return [];
  }
}

export async function fetchFeaturedMatch(): Promise<FeaturedMatchView | null> {
  const upcoming = await fetchUpcomingMatches();
  const liveMatch = findLiveMatch(upcoming);

  return liveMatch ?? upcoming[0] ?? null;
}

export async function enrichFixtureWithTxlineOdds(
  fixture: FixtureCatalogEntry,
): Promise<FeaturedMatchView | null> {
  const network = await getRequestSettlementNetwork();
  const credentials = getTxlineCredentials(network);
  if (!credentials) {
    return null;
  }

  const client = new TxlineClient({
    credentials,
    network,
  });
  return hydrateFixtureFromTxline(fixture, client);
}
