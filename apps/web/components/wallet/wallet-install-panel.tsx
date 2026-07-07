"use client";

import type { Wallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getWalletInstallInfo, openWalletInstallLink } from "@/lib/wallet/install-links";

type WalletInstallPanelProps = {
  wallet: Wallet;
  onBack: () => void;
};

export function WalletInstallPanel({ wallet, onBack }: WalletInstallPanelProps) {
  const installInfo = getWalletInstallInfo(
    wallet.adapter.name,
    wallet.adapter.url,
  );

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to wallets
      </button>

      <div className="flex flex-col items-center gap-4 text-center">
        {wallet.adapter.icon ? (
          <img
            src={wallet.adapter.icon}
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-2xl"
          />
        ) : (
          <span className="size-14 rounded-2xl bg-muted" />
        )}

        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {installInfo.headline}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {installInfo.description}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={() => openWalletInstallLink(installInfo.extensionUrl)}
        >
          Get extension
          <ExternalLink className="size-4" />
        </button>

        {installInfo.webWalletUrl ? (
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-4 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
            onClick={() => openWalletInstallLink(installInfo.webWalletUrl!)}
          >
            Use web wallet
            <ExternalLink className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
