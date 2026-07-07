"use client";

import { Wallet, ShieldCheck, Unplug } from "lucide-react";

import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyClipButton } from "@/components/ui/copy-clip-button";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useWalletProfile } from "@/hooks/use-wallet-profile";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { getSolanaNetwork, getSolanaProgramId } from "@/lib/solana/config";
import { isConvexConfigured } from "@/lib/env/runtime";
import { appToast } from "@/lib/toast";
import { shortWalletAddress } from "@/lib/wallet/utils";

export function WalletPageContent() {
  const { isSessionActive, isRestoring, isConnected, walletPubkey, disconnect, wallet } =
    useWalletSession();
  const { profile, displayLabel, loading } = useWalletProfile();
  const {
    sol: balanceAmount,
    loading: balanceLoading,
    error: balanceError,
  } = useWalletBalance();
  const network = getSolanaNetwork();

  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-8 pb-8">
        <PageHeader
          eyebrow="Settlement"
          title="Wallet"
          description="Your Solana wallet is your identity on Goalaxify — required for predictions, voice booth sessions, and on-chain settlement."
        />

        <Card className="border-border/80">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-dusty-blue/15 text-brand-dusty-blue">
                  <Wallet className="size-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {isSessionActive ? displayLabel : "Not connected"}
                  </p>
                  {walletPubkey ? (
                    <div className="mt-1 flex items-start gap-1.5">
                      <p className="min-w-0 break-all font-mono text-xs text-muted-foreground">
                        {walletPubkey}
                      </p>
                      <CopyClipButton
                        value={walletPubkey}
                        label="Copy wallet address"
                        className="mt-0.5 size-6"
                      />
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Connect to get started
                    </p>
                  )}
                </div>
              </div>
              {!isSessionActive ? (
                <ConnectWalletButton size="sm" useConnectedMenu={false} />
              ) : null}
            </div>

            {isRestoring ? (
              <p className="text-sm text-muted-foreground">
                Restoring your wallet session…
              </p>
            ) : null}

            {isSessionActive && (
              <WalletBalanceCard
                label={network === "devnet" ? "Devnet balance" : "Balance"}
                amount={balanceAmount}
                loading={balanceLoading}
                error={balanceError}
              />
            )}

            {isSessionActive && (
              <div className="grid gap-3 rounded-2xl bg-muted/50 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Wallet app</span>
                  <span className="font-medium">{wallet?.adapter.name ?? "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium capitalize">{network}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Short address</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium">
                      {shortWalletAddress(walletPubkey)}
                    </span>
                    {walletPubkey ? (
                      <CopyClipButton
                        value={walletPubkey}
                        label="Copy wallet address"
                        className="size-6"
                      />
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Convex profile</span>
                  <span className="font-medium">
                    {loading
                      ? "Syncing…"
                      : isConvexConfigured() && profile
                        ? "Synced"
                        : isConvexConfigured()
                          ? "Pending"
                          : "Offline"}
                  </span>
                </div>
              </div>
            )}

            {isSessionActive && (
              <Button
                variant="outline"
                onClick={() => {
                  void disconnect();
                  appToast.walletDisconnected();
                }}
              >
                <Unplug className="size-4" />
                Disconnect wallet
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-dashed border-border/80">
          <CardContent className="flex items-start gap-3 p-5 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-mint" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Settlement program</p>
              <p>
                Predictions will settle against the TxODDS oracle on Solana
                {getSolanaProgramId()
                  ? ` (${shortWalletAddress(getSolanaProgramId(), 6)}).`
                  : "."}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </AppShell>
  );
}
