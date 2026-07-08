import "server-only";

import { TxlineClient } from "@goalaxify/txline-sdk/client";

import type { MomentView } from "@/lib/data/types";
import { getTxlineCredentials } from "@/lib/data/txline/credentials";
import { mapTxlineScoresToMoments } from "@/lib/data/txline/map-moments";
import { getRequestSettlementNetwork } from "@/lib/solana/network-server";
import {
  enrichMomentsWithWscClips,
  fetchWscMatchClips,
  isWscConfigured,
} from "@/lib/data/wsc";

export async function fetchLiveMoments(
  fixtureId: number,
  homeTeam: string,
  awayTeam: string,
): Promise<MomentView[]> {
  const network = await getRequestSettlementNetwork();
  const credentials = getTxlineCredentials(network);
  if (!credentials) {
    return [];
  }

  const client = new TxlineClient({ credentials, network });

  try {
    const [snapshot, wscClips] = await Promise.all([
      client.getScoresSnapshot(fixtureId),
      isWscConfigured()
        ? fetchWscMatchClips(homeTeam, awayTeam)
        : Promise.resolve([]),
    ]);

    const txlineMoments = mapTxlineScoresToMoments(
      snapshot,
      fixtureId,
      homeTeam,
      awayTeam,
    );

    return enrichMomentsWithWscClips(txlineMoments, wscClips);
  } catch {
    return [];
  }
}
