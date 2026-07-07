"use client";

import { useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";

import { VoiceBooth } from "@/components/booth/voice-booth";
import { CollapsibleFixturePicker } from "@/components/match/collapsible-fixture-picker";
import { WalletGate } from "@/components/wallet/wallet-gate";
import {
  resolveFixtureMetaForPrediction,
  useFixtureKickoffs,
} from "@/hooks/use-fixture-kickoffs";
import {
  matchToBoothContext,
  resolveInitialFixtureId,
} from "@/lib/data/booth-context";
import type { BoothManageBet, FeaturedMatchView } from "@/lib/data/types";
import { canManageBet } from "@/lib/utils/bet-display";
import { api } from "@goalaxify/convex/_generated/api";
import type { Id } from "@goalaxify/convex/_generated/dataModel";
import { isConvexConfigured } from "@/lib/env/runtime";

type BoothPageContentProps = {
  matches: FeaturedMatchView[];
  initialFixtureId?: number;
  managePredictionId?: string;
};

export function BoothPageContent({
  matches,
  initialFixtureId,
  managePredictionId,
}: BoothPageContentProps) {
  const defaultFixtureId = resolveInitialFixtureId(matches, initialFixtureId);
  const [selectedFixtureId, setSelectedFixtureId] = useState(defaultFixtureId);
  const [sessionLocked, setSessionLocked] = useState(false);

  const prediction = useQuery(
    api.predictions.getById,
    isConvexConfigured() && managePredictionId
      ? { predictionId: managePredictionId as Id<"predictions"> }
      : "skip",
  );

  const { kickoffByFixtureId, kickoffByTeams } = useFixtureKickoffs();

  useEffect(() => {
    if (prediction?.fixtureId) {
      setSelectedFixtureId(prediction.fixtureId);
      return;
    }
    setSelectedFixtureId(defaultFixtureId);
  }, [defaultFixtureId, prediction?.fixtureId]);

  const selectedMatch = useMemo(
    () =>
      matches.find((match) => match.fixtureId === selectedFixtureId) ??
      matches[0],
    [matches, selectedFixtureId],
  );

  const boothContext = selectedMatch
    ? matchToBoothContext(selectedMatch)
    : null;

  const manageBet: BoothManageBet | null = useMemo(() => {
    if (!prediction || !managePredictionId) return null;

    const fixtureMeta = resolveFixtureMetaForPrediction(
      prediction,
      kickoffByFixtureId,
      kickoffByTeams,
    );

    if (
      !canManageBet(prediction, fixtureMeta.kickoffAt, fixtureMeta.status)
    ) {
      return null;
    }

    return {
      predictionId: prediction._id,
      selection: prediction.selection,
      stakeAmount: prediction.stakeAmount,
      stakeToken: prediction.stakeToken,
      homeTeam: prediction.homeTeam,
      awayTeam: prediction.awayTeam,
      estimatedReturn: prediction.estimatedReturn,
      kickoffAt: fixtureMeta.kickoffAt ?? prediction.kickoffAt,
    };
  }, [
    kickoffByFixtureId,
    kickoffByTeams,
    managePredictionId,
    prediction,
  ]);

  if (!boothContext || matches.length === 0) {
    return null;
  }

  return (
    <WalletGate
      title="Wallet required for the booth"
      description="Connect your Solana wallet before talking your prediction. Your wallet address is linked to your voice session and settlement proof."
    >
      <div className="space-y-3">
        {managePredictionId && prediction && !manageBet ? (
          <div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            This bet can no longer be changed — it was already updated once, or
            the match has started.
          </div>
        ) : null}

        <VoiceBooth
          key={`${boothContext.fixtureId}-${managePredictionId ?? "new"}`}
          context={boothContext}
          manageBet={manageBet}
          autoStartSession={!!manageBet}
          onSessionActiveChange={setSessionLocked}
        />

        <CollapsibleFixturePicker
          matches={matches}
          selectedFixtureId={selectedFixtureId}
          onSelect={setSelectedFixtureId}
          disabled={sessionLocked || !!manageBet}
        />
      </div>
    </WalletGate>
  );
}
