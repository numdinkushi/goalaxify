"use client";

import type { ReactNode } from "react";
import { Shield } from "lucide-react";

import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Card, CardContent } from "@/components/ui/card";
import { useWalletSession } from "@/hooks/use-wallet-session";

type WalletGateProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function WalletGate({
  children,
  title = "Connect your wallet",
  description = "Link your Phantom wallet to place predictions, enter the voice booth, and receive settlement proofs.",
}: WalletGateProps) {
  const { isSessionActive, connecting, isRestoring } = useWalletSession();

  if (isSessionActive) {
    return <>{children}</>;
  }

  return (
    <Card className="border-dashed border-border/80 bg-card/70">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-dusty-blue/15 text-brand-dusty-blue">
          <Shield className="size-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <ConnectWalletButton
          showAddressWhenConnected={false}
          useConnectedMenu={false}
          className="min-w-44"
        />

        {connecting || isRestoring ? (
          <p className="text-xs text-muted-foreground">
            Restoring your wallet session…
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
