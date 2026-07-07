"use client";

import type { Doc } from "@goalaxify/convex/_generated/dataModel";

import { BetCard } from "@/components/predictions/bet-card";
import { Card, CardContent } from "@/components/ui/card";
import { useClaimWinnings } from "@/hooks/use-claim-winnings";
import {
  resolveFixtureMetaForPrediction,
  useFixtureKickoffs,
} from "@/hooks/use-fixture-kickoffs";
import { usePredictions } from "@/hooks/use-predictions";
import { useWalletSession } from "@/hooks/use-wallet-session";

export function BetsPanel() {
  const { walletPubkey, isConnected } = useWalletSession();
  const { predictions, loading } = usePredictions();
  const { kickoffByFixtureId, kickoffByTeams, loading: fixturesLoading } =
    useFixtureKickoffs();
  const { claimPrediction, claimingId } = useClaimWinnings();

  if (!isConnected || !walletPubkey) {
    return null;
  }

  const isLoading = loading || fixturesLoading;

  return (
    <Card className="border-border/80">
      <CardContent className="space-y-4 p-6">
        <div>
          <p className="text-sm font-semibold">Your bets</p>
          <p className="text-xs text-muted-foreground">
            Stakes, potential wins, match kickoffs, and settlement status. Open
            bets can be changed once by voice before kickoff.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading bets…</p>
        ) : predictions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bets yet. Talk your prediction in the booth to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {predictions.map((prediction: Doc<"predictions">) => (
              <BetCard
                key={prediction._id}
                prediction={prediction}
                fixtureMeta={resolveFixtureMetaForPrediction(
                  prediction,
                  kickoffByFixtureId,
                  kickoffByTeams,
                )}
                claiming={claimingId === prediction._id}
                onClaim={
                  prediction.status === "won"
                    ? () => void claimPrediction(prediction._id, walletPubkey)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
