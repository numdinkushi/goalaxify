"use client";

import { useQuery } from "convex/react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { VoiceBooth } from "@/components/booth/voice-booth";
import { CollapsibleFixturePicker } from "@/components/match/collapsible-fixture-picker";
import { WalletGate } from "@/components/wallet/wallet-gate";
import {
  resolveFixtureMetaForPrediction,
  useFixtureKickoffs,
} from "@/hooks/use-fixture-kickoffs";
import { useLockPredictionsOnKickoff } from "@/hooks/use-lock-predictions-on-kickoff";
import { usePredictions } from "@/hooks/use-predictions";
import { useTranslation } from "@/hooks/use-translation";
import {
  buildManageBoothHref,
  matchToBoothContext,
  resolveInitialFixtureId,
} from "@/lib/data/booth-context";
import type { FeaturedMatchView } from "@/lib/data/types";
import { MatchStatus } from "@/lib/enums";
import { toBoothManageBet } from "@/lib/utils/bet-display";
import {
  deriveMatchStatus,
  isBoothOpenForMatch,
} from "@/lib/utils/match";
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
  const { t } = useTranslation();
  const router = useRouter();
  const defaultFixtureId = resolveInitialFixtureId(matches, initialFixtureId);
  const [selectedFixtureId, setSelectedFixtureId] = useState(defaultFixtureId);
  const [sessionLocked, setSessionLocked] = useState(false);
  const { predictions: openPredictions } = usePredictions("open");

  const predictionFromUrl = useQuery(
    api.predictions.getById,
    isConvexConfigured() && managePredictionId
      ? { predictionId: managePredictionId as Id<"predictions"> }
      : "skip",
  );

  const { kickoffByFixtureId, kickoffByTeams } = useFixtureKickoffs();

  useEffect(() => {
    if (predictionFromUrl?.fixtureId) {
      setSelectedFixtureId(predictionFromUrl.fixtureId);
      return;
    }
    setSelectedFixtureId(defaultFixtureId);
  }, [defaultFixtureId, predictionFromUrl?.fixtureId]);

  const selectedMatch = useMemo(
    () =>
      matches.find((match) => match.fixtureId === selectedFixtureId) ??
      matches[0],
    [matches, selectedFixtureId],
  );

  const boothContext = selectedMatch
    ? matchToBoothContext(selectedMatch)
    : null;

  const boothLocked = useMemo(() => {
    if (!selectedMatch) return true;
    const status = deriveMatchStatus(
      selectedMatch.kickoffAt,
      selectedMatch.status,
    );
    return !isBoothOpenForMatch(selectedMatch.kickoffAt, status);
  }, [selectedMatch]);

  useLockPredictionsOnKickoff(
    selectedMatch?.fixtureId,
    selectedMatch?.kickoffAt ?? "",
    selectedMatch?.status ?? MatchStatus.Scheduled,
  );

  const openBetForFixture = useMemo(
    () =>
      openPredictions.find(
        (prediction) => prediction.fixtureId === selectedFixtureId,
      ) ?? null,
    [openPredictions, selectedFixtureId],
  );

  const activePrediction = useMemo(() => {
    if (
      predictionFromUrl &&
      managePredictionId &&
      predictionFromUrl.fixtureId === selectedFixtureId
    ) {
      return predictionFromUrl;
    }

    return openBetForFixture;
  }, [
    managePredictionId,
    openBetForFixture,
    predictionFromUrl,
    selectedFixtureId,
  ]);

  const manageBet = useMemo(() => {
    if (boothLocked || !activePrediction) {
      return null;
    }

    const fixtureMeta = resolveFixtureMetaForPrediction(
      activePrediction,
      kickoffByFixtureId,
      kickoffByTeams,
    );

    return toBoothManageBet(activePrediction, fixtureMeta);
  }, [
    activePrediction,
    boothLocked,
    kickoffByFixtureId,
    kickoffByTeams,
  ]);

  useEffect(() => {
    if (sessionLocked || boothLocked || !activePrediction || !manageBet) {
      return;
    }

    if (managePredictionId === activePrediction._id) {
      return;
    }

    router.replace(
      buildManageBoothHref(selectedFixtureId, activePrediction._id),
      { scroll: false },
    );
  }, [
    activePrediction,
    boothLocked,
    manageBet,
    managePredictionId,
    router,
    selectedFixtureId,
    sessionLocked,
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
        {boothLocked ? (
          <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium text-foreground">
                {t("booth.lockedTitle")}
              </p>
              <p className="mt-1">{t("booth.lockedDescription")}</p>
            </div>
          </div>
        ) : activePrediction && !manageBet ? (
          <div className="rounded-2xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            This bet can no longer be changed — it was already updated once, or
            the match has started.
          </div>
        ) : null}

        <VoiceBooth
          key={`${boothContext.fixtureId}-${activePrediction?._id ?? "new"}`}
          context={boothContext}
          manageBet={manageBet}
          boothLocked={boothLocked}
          autoStartSession={!!manageBet}
          onSessionActiveChange={setSessionLocked}
        />

        <CollapsibleFixturePicker
          matches={matches}
          selectedFixtureId={selectedFixtureId}
          onSelect={setSelectedFixtureId}
          disabled={sessionLocked || !!manageBet || boothLocked}
        />
      </div>
    </WalletGate>
  );
}
