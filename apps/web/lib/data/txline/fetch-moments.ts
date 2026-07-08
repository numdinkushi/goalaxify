import "server-only";

import { TxlineClient } from "@goalaxify/txline-sdk/client";

import type { MomentView } from "@/lib/data/types";
import { resolveTxlineCredentialsForServer } from "@/lib/data/txline/credentials-server";
import { mapTxlineScoresToMoments } from "@/lib/data/txline/map-moments";
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
  const auth = await resolveTxlineCredentialsForServer();
  if (!auth) {
    return [];
  }

  const client = new TxlineClient({
    credentials: {
      guestJwt: auth.guestJwt,
      apiToken: auth.apiToken,
    },
    network: auth.network,
  });

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
