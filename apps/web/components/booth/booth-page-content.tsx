"use client";

import { useEffect, useMemo, useState } from "react";

import { VoiceBooth } from "@/components/booth/voice-booth";
import { CollapsibleFixturePicker } from "@/components/match/collapsible-fixture-picker";
import { WalletGate } from "@/components/wallet/wallet-gate";
import {
  matchToBoothContext,
  resolveInitialFixtureId,
} from "@/lib/data/booth-context";
import type { FeaturedMatchView } from "@/lib/data/types";

type BoothPageContentProps = {
  matches: FeaturedMatchView[];
  initialFixtureId?: number;
};

export function BoothPageContent({
  matches,
  initialFixtureId,
}: BoothPageContentProps) {
  const defaultFixtureId = resolveInitialFixtureId(matches, initialFixtureId);
  const [selectedFixtureId, setSelectedFixtureId] = useState(defaultFixtureId);
  const [sessionLocked, setSessionLocked] = useState(false);

  useEffect(() => {
    setSelectedFixtureId(defaultFixtureId);
  }, [defaultFixtureId]);

  const selectedMatch = useMemo(
    () =>
      matches.find((match) => match.fixtureId === selectedFixtureId) ??
      matches[0],
    [matches, selectedFixtureId],
  );

  const boothContext = selectedMatch
    ? matchToBoothContext(selectedMatch)
    : null;

  if (!boothContext || matches.length === 0) {
    return null;
  }

  return (
    <WalletGate
      title="Wallet required for the booth"
      description="Connect your Solana wallet before talking your prediction. Your wallet address is linked to your voice session and settlement proof."
    >
      <div className="space-y-3">
        <VoiceBooth
          key={boothContext.fixtureId}
          context={boothContext}
          onSessionActiveChange={setSessionLocked}
        />

        <CollapsibleFixturePicker
          matches={matches}
          selectedFixtureId={selectedFixtureId}
          onSelect={setSelectedFixtureId}
          disabled={sessionLocked}
        />
      </div>
    </WalletGate>
  );
}
