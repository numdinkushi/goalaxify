"use client";

import type { Doc } from "@goalaxify/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useClaimWinnings } from "@/hooks/use-claim-winnings";
import { usePredictions } from "@/hooks/use-predictions";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { OUTCOME_LABELS } from "@/lib/data/types";
import type { MatchOutcome } from "@goalaxify/domain";

export function PredictionsPanel() {
  const { walletPubkey, isConnected } = useWalletSession();
  const { predictions, loading } = usePredictions();
  const { claimPrediction, claimingId } = useClaimWinnings();

  if (!isConnected || !walletPubkey) {
    return null;
  }

  return (
    <Card className="border-border/80">
      <CardContent className="space-y-4 p-6">
        <div>
          <p className="text-sm font-semibold">Your predictions</p>
          <p className="text-xs text-muted-foreground">
            Open bets, settlement status, and claimable winnings.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading predictions…</p>
        ) : predictions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No predictions yet. Talk your bet in the booth to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border/80">
            {predictions.map((prediction: Doc<"predictions">) => (
              <li
                key={prediction._id}
                className="flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {prediction.homeTeam} vs {prediction.awayTeam}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {OUTCOME_LABELS[prediction.selection as MatchOutcome] ?? prediction.selection}
                    {" · "}
                    {prediction.stakeAmount} {prediction.stakeToken}
                    {" · "}
                    {prediction.status}
                  </p>
                </div>

                {prediction.status === "won" ? (
                  <Button
                    size="sm"
                    disabled={claimingId === prediction._id}
                    onClick={() =>
                      void claimPrediction(prediction._id, walletPubkey)
                    }
                  >
                    {claimingId === prediction._id ? "Claiming…" : "Claim winnings"}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
