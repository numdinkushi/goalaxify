"use client";

import Link from "next/link";
import { Mic, PlayCircle, ShieldCheck } from "lucide-react";

import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ActionCardView, SettlementBadgeView } from "@/lib/data/types";
import { AppRoute } from "@/lib/enums";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { cn } from "@/lib/utils";

const ICONS = {
  "enter-booth": Mic,
  "the-pitch": PlayCircle,
} as const;

type ActionCardsProps = {
  actions: ActionCardView[];
  settlement: SettlementBadgeView;
};

export function ActionCards({ actions, settlement }: ActionCardsProps) {
  const { isConnected } = useWalletSession();

  return (
    <section className="space-y-3">
      {actions.map((action) => {
        const Icon = ICONS[action.id as keyof typeof ICONS] ?? Mic;
        const requiresWallet = action.id === "enter-booth";
        const blocked = requiresWallet && !isConnected;

        return (
          <Card key={action.id} className="border-border/80">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-coral/15 text-brand-coral">
                <Icon className="size-6" />
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <h3 className="text-base font-semibold">{action.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                  {blocked && (
                    <p className="mt-2 text-xs text-brand-pastel-pink">
                      Connect your wallet to enter the voice booth.
                    </p>
                  )}
                </div>

                {blocked ? (
                  <ConnectWalletButton
                    size="sm"
                    showAddressWhenConnected={false}
                    useConnectedMenu={false}
                  />
                ) : (
                  <Link
                    href={action.href}
                    className={cn(
                      buttonVariants({ variant: action.variant, size: "sm" }),
                      "w-full sm:w-auto",
                      action.disabled && "pointer-events-none opacity-50",
                    )}
                    aria-disabled={action.disabled}
                  >
                    {action.cta}
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-dusty-blue/40 bg-brand-dusty-blue/10 px-4 py-3 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 text-brand-dusty-blue" />
        <span>
          {settlement.label}{" "}
          <span className="font-medium text-foreground">{settlement.provider}</span>
        </span>
      </div>

      {!isConnected && (
        <p className="text-center text-xs text-muted-foreground">
          Need a wallet?{" "}
          <Link href={AppRoute.Wallet} className="text-brand-coral hover:underline">
            Set up in Wallet
          </Link>
        </p>
      )}
    </section>
  );
}
