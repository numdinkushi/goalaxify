"use client";

import {
  SolanaNetworkBadge,
  SolanaNetworkToggle,
} from "@/components/wallet/solana-network-toggle";

type WalletNetworkRowProps = {
  compact?: boolean;
};

export function WalletNetworkRow({ compact = false }: WalletNetworkRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">Network</span>
      <div className="flex items-center gap-2">
        <SolanaNetworkBadge />
        <SolanaNetworkToggle size={compact ? "sm" : "md"} />
      </div>
    </div>
  );
}
