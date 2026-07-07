import { TxlineClient } from "@goalaxify/txline-sdk/client";

import type { MomentView } from "@/lib/data/types";
import { getTxlineCredentials } from "@/lib/data/txline/enrich";
import { mapTxlineScoresToMoments } from "@/lib/data/txline/map-moments";

export async function fetchLiveMoments(
  fixtureId: number,
  homeTeam: string,
  awayTeam: string,
): Promise<MomentView[]> {
  const credentials = getTxlineCredentials();
  if (!credentials) {
    return [];
  }

  const client = new TxlineClient({ credentials });

  try {
    const snapshot = await client.getScoresSnapshot(fixtureId);
    return mapTxlineScoresToMoments(snapshot, fixtureId, homeTeam, awayTeam);
  } catch {
    return [];
  }
}
