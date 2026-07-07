import { TxlineClient } from "@goalaxify/txline-sdk/client";

import type { FixtureCatalogEntry } from "@/lib/constants/fixtures";
import type { FeaturedMatchView } from "@/lib/data/types";
import { mapTxlineOddsSnapshot } from "@/lib/data/txline/map-odds";
import { OddsSource } from "@/lib/enums";

function getTxlineCredentials() {
  const guestJwt = process.env.TXLINE_GUEST_JWT;
  const apiToken = process.env.TXLINE_API_TOKEN;
  if (!guestJwt || !apiToken) return null;
  return { guestJwt, apiToken };
}

export function isTxlineConfigured(): boolean {
  return getTxlineCredentials() !== null;
}

export function catalogToMatchView(
  fixture: FixtureCatalogEntry,
  oddsSource: OddsSource = OddsSource.Mock,
): FeaturedMatchView {
  return {
    ref: fixture.ref,
    fixtureId: fixture.fixtureId,
    home: fixture.home,
    away: fixture.away,
    venue: fixture.venue,
    kickoffAt: fixture.kickoffAt,
    status: fixture.status,
    round: fixture.round,
    boothOpen: fixture.boothOpen,
    market: fixture.marketOdds,
    crowd: fixture.crowdOdds,
    marketDeltaPct: fixture.marketDeltaPct,
    oddsSource,
  };
}

export async function enrichFixtureWithTxlineOdds(
  fixture: FixtureCatalogEntry,
): Promise<FeaturedMatchView> {
  const credentials = getTxlineCredentials();
  if (!credentials || !fixture.txlineFixtureId) {
    return catalogToMatchView(fixture, OddsSource.Mock);
  }

  try {
    const client = new TxlineClient({ credentials });
    const snapshot = await client.getOddsSnapshot(fixture.txlineFixtureId);
    const mapped = mapTxlineOddsSnapshot(snapshot);

    if (!mapped) {
      return catalogToMatchView(fixture, OddsSource.Mock);
    }

    return catalogToMatchView(
      { ...fixture, marketOdds: mapped },
      OddsSource.Txline,
    );
  } catch {
    return catalogToMatchView(fixture, OddsSource.Mock);
  }
}
