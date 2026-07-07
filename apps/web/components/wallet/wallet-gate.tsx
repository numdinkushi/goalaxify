"use client";

import type { ReactNode } from "react";
import { Shield } from "lucide-react";

import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Card, CardContent } from "@/components/ui/card";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useTranslation } from "@/hooks/use-translation";

type WalletGateProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function WalletGate({
  children,
  title,
  description,
}: WalletGateProps) {
  const { isSessionActive, connecting, isRestoring } = useWalletSession();
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("wallet.gateTitle");
  const resolvedDescription = description ?? t("wallet.gateDescription");

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
          <h3 className="text-lg font-semibold">{resolvedTitle}</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {resolvedDescription}
          </p>
        </div>

        <ConnectWalletButton
          showAddressWhenConnected={false}
          useConnectedMenu={false}
          className="min-w-44"
        />

        {connecting || isRestoring ? (
          <p className="text-xs text-muted-foreground">
            {t("wallet.restoring")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
