import "server-only";

import { TxlineClient } from "@goalaxify/txline-sdk/client";

import { MatchStatus } from "@/lib/enums";
import { getTxlineCredentials } from "@/lib/data/txline/credentials";
import { getRequestSettlementNetwork } from "@/lib/solana/network-server";
import { deriveMatchStatus } from "@/lib/utils/match";
import { deriveWinnerFromScore } from "@/lib/utils/prediction";
import { mapTxlineFixturesSnapshot } from "./map-fixtures";
import { extractScoresFromSnapshot, mapTxlineScoresStatus } from "./map-scores";

export type FixtureResultView = {
  fixtureId: number;
  kickoffAt?: string;
  round?: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  winningSelection?: string;
};

export async function fetchFixtureResult(
  fixtureId: number,
): Promise<FixtureResultView | null> {
  const network = await getRequestSettlementNetwork();
  const credentials = getTxlineCredentials(network);
  if (!credentials) {
    return null;
  }

  const client = new TxlineClient({ credentials, network });

  try {
    const [fixturesSnapshot, scoresSnapshot] = await Promise.all([
      client.listFixtures().catch(() => null),
      client.getScoresSnapshot(fixtureId).catch(() => null),
    ]);

    let kickoffAt: string | undefined;
    let round: string | undefined;
    let reportedStatus = MatchStatus.Scheduled;

    if (fixturesSnapshot) {
      const fixtures = mapTxlineFixturesSnapshot(fixturesSnapshot);
      const fixture = fixtures.find((entry) => entry.fixtureId === fixtureId);
      if (fixture) {
        kickoffAt = fixture.kickoffAt;
        round = fixture.round;
        reportedStatus = fixture.reportedStatus;
      }
    }

    const scores = extractScoresFromSnapshot(scoresSnapshot);
    const scoresStatus =
      kickoffAt !== undefined
        ? mapTxlineScoresStatus(scoresSnapshot, kickoffAt)
        : scores.isFinished
          ? MatchStatus.Finished
          : null;

    const status = deriveMatchStatus(
      kickoffAt ?? new Date(0).toISOString(),
      scores.isFinished
        ? MatchStatus.Finished
        : (scoresStatus ?? reportedStatus),
    );

    const hasScore =
      scores.isFinished || scores.homeScore > 0 || scores.awayScore > 0;
    const homeScore = hasScore ? scores.homeScore : undefined;
    const awayScore = hasScore ? scores.awayScore : undefined;
    const winningSelection =
      status === MatchStatus.Finished &&
      homeScore !== undefined &&
      awayScore !== undefined
        ? deriveWinnerFromScore(homeScore, awayScore)
        : undefined;

    return {
      fixtureId,
      kickoffAt,
      round,
      status,
      homeScore,
      awayScore,
      winningSelection,
    };
  } catch {
    return null;
  }
}
