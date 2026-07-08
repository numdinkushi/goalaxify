"use client";

import { useSolanaNetwork } from "@/components/providers/solana-network-provider";
import { SOLANA_NETWORK_OPTIONS } from "@/lib/solana/network-constants";
import { getSolanaNetworkDisplayLabel } from "@/lib/solana/network-utils";
import { cn } from "@/lib/utils";

type SolanaNetworkToggleProps = {
  className?: string;
  size?: "sm" | "md";
};

export function SolanaNetworkToggle({
  className,
  size = "md",
}: SolanaNetworkToggleProps) {
  const { network, setNetwork } = useSolanaNetwork();

  return (
    <div
      role="group"
      aria-label="Solana network"
      className={cn(
        "inline-flex rounded-full border border-border/70 bg-muted/40 p-0.5",
        size === "sm" ? "gap-0.5" : "gap-1",
        className,
      )}
    >
      {SOLANA_NETWORK_OPTIONS.map((option) => {
        const active = network === option;

        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            className={cn(
              "cursor-pointer rounded-full font-medium transition-colors",
              size === "sm"
                ? "px-2.5 py-1 text-[11px]"
                : "px-3 py-1.5 text-xs",
              active
                ? "bg-brand-coral text-white shadow-sm shadow-brand-coral/30"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setNetwork(option)}
          >
            {getSolanaNetworkDisplayLabel(option)}
          </button>
        );
      })}
    </div>
  );
}

export function SolanaNetworkBadge() {
  const { networkLabel, isMainnet } = useSolanaNetwork();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        isMainnet
          ? "bg-brand-mint/15 text-brand-mint"
          : "bg-brand-dusty-blue/15 text-brand-dusty-blue",
      )}
    >
      {networkLabel}
    </span>
  );
}
