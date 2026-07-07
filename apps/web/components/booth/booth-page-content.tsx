"use client";

import { VoiceBooth } from "@/components/booth/voice-booth";
import { WalletGate } from "@/components/wallet/wallet-gate";
import type { BoothContext } from "@/lib/data/types";

type BoothPageContentProps = {
  context: BoothContext;
};

export function BoothPageContent({ context }: BoothPageContentProps) {
  return (
    <WalletGate
      title="Wallet required for the booth"
      description="Connect your Solana wallet before talking your prediction. Your wallet address is linked to your voice session and settlement proof."
    >
      <VoiceBooth context={context} />
    </WalletGate>
  );
}
