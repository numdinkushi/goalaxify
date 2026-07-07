"use client";

import Link from "next/link";

import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { useWalletProfile } from "@/hooks/use-wallet-profile";
import { profileTabHref } from "@/hooks/use-profile-tab";
import { ProfileTab } from "@/lib/enums";
import { shortWalletAddress } from "@/lib/wallet/utils";
import { cn } from "@/lib/utils";

type WalletStatusChipProps = {
  className?: string;
};

export function WalletStatusChip({ className }: WalletStatusChipProps) {
  const { isConnected, walletPubkey, displayLabel } = useWalletProfile();

  if (!isConnected || !walletPubkey) {
    return (
      <div className={cn("flex justify-end px-6 pt-4", className)}>
        <ConnectWalletButton size="sm" showAddressWhenConnected={false} />
      </div>
    );
  }

  return (
    <div className={cn("flex justify-end px-6 pt-4", className)}>
      <Link
        href={profileTabHref(ProfileTab.Wallet)}
        className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:border-brand-coral/40"
      >
        <span className="size-2 rounded-full bg-success" aria-hidden />
        <span>{displayLabel}</span>
        <span className="font-mono text-muted-foreground">
          {shortWalletAddress(walletPubkey)}
        </span>
      </Link>
    </div>
  );
}
