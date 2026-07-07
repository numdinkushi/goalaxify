"use client";

import type { Doc } from "@goalaxify/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ExternalLink,
  Mic,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OUTCOME_LABELS } from "@/lib/data/types";
import { AppRoute } from "@/lib/enums";
import { getSolanaNetwork } from "@/lib/solana/config";
import {
  canManageBet,
  formatBetKickoff,
  getBetStatusMeta,
  isMatchStarted,
  resolveBetKickoff,
  resolveBetPayout,
} from "@/lib/utils/bet-display";
import { formatMatchTitle } from "@/lib/utils/format";
import { formatTokenAmount } from "@/lib/utils/prediction";
import type { MatchOutcome } from "@goalaxify/domain";
import { cn } from "@/lib/utils";

type BetCardProps = {
  prediction: Doc<"predictions">;
  fixtureMeta?: { kickoffAt?: string; round?: string; status?: string };
  onClaim?: () => void;
  claiming?: boolean;
};

const STATUS_BADGE: Record<
  ReturnType<typeof getBetStatusMeta>["tone"],
  "outline" | "live" | "mint" | "secondary" | "default" | "accent"
> = {
  open: "outline",
  pending: "live",
  won: "mint",
  lost: "secondary",
  settled: "default",
  cancelled: "secondary",
  replaced: "accent",
};

export function BetCard({
  prediction,
  fixtureMeta,
  onClaim,
  claiming = false,
}: BetCardProps) {
  const router = useRouter();
  const kickoff = resolveBetKickoff(prediction, fixtureMeta);
  const kickoffDisplay = formatBetKickoff(kickoff.kickoffAt);
  const matchStarted = isMatchStarted(
    prediction,
    kickoff.kickoffAt,
    kickoff.matchStatus,
  );
  const manageable = canManageBet(
    prediction,
    kickoff.kickoffAt,
    kickoff.matchStatus,
  );
  const status = getBetStatusMeta(prediction.status);
  const payout = resolveBetPayout(prediction);
  const network = getSolanaNetwork();
  const explorerCluster =
    network === "mainnet-beta" ? "" : `?cluster=${network}`;

  const manageHref = `${AppRoute.Booth}?fixture=${prediction.fixtureId}&prediction=${prediction._id}`;

  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold">
            {formatMatchTitle(prediction.homeTeam, prediction.awayTeam)}
          </p>
          {kickoff.round ? (
            <p className="text-xs text-muted-foreground">{kickoff.round}</p>
          ) : null}
        </div>
        <Badge variant={STATUS_BADGE[status.tone]}>{status.label}</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Your pick</p>
          <p className="mt-1 font-medium">
            {OUTCOME_LABELS[prediction.selection as MatchOutcome] ??
              prediction.selection}
          </p>
        </div>

        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Stake</p>
          <p className="mt-1 font-medium tabular-nums">
            {formatTokenAmount(payout.stake)} {payout.token}
          </p>
        </div>

        <div className="rounded-xl border border-brand-coral/20 bg-brand-coral/5 p-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5" />
            {payout.isFinal && prediction.status !== "cancelled" && prediction.status !== "replaced"
              ? "Result payout"
              : prediction.status === "cancelled" || prediction.status === "replaced"
                ? "Refunded stake"
                : "Potential win"}
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums">
            {formatTokenAmount(payout.payout)} {payout.token}
          </p>
          {prediction.status !== "cancelled" && prediction.status !== "replaced" ? (
            <p
              className={cn(
                "mt-0.5 text-xs tabular-nums",
                payout.profit > 0
                  ? "text-brand-mint"
                  : payout.profit < 0
                    ? "text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {payout.profit >= 0 ? "+" : ""}
              {formatTokenAmount(payout.profit)} {payout.token}
              {!payout.isFinal ? " potential profit" : " profit"}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl bg-muted/40 p-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5" />
            Match starts
          </p>
          <p className="mt-1 font-medium">{kickoffDisplay.primary}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {matchStarted && prediction.status === "open"
              ? "Match started — changes locked"
              : kickoffDisplay.secondary}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {manageable ? (
          <p className="inline-flex items-center gap-1 text-xs text-brand-coral">
            <Mic className="size-3.5" />
            Tap to cancel or replace by voice (once)
          </p>
        ) : null}

        {prediction.status === "won" && onClaim ? (
          <Button
            size="sm"
            disabled={claiming}
            onClick={(event) => {
              event.stopPropagation();
              onClaim();
            }}
          >
            {claiming ? "Claiming…" : "Claim winnings"}
          </Button>
        ) : null}

        {prediction.intentTxSig ? (
          <a
            href={`https://explorer.solana.com/tx/${prediction.intentTxSig}${explorerCluster}`}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View stake tx
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
    </>
  );

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/80 bg-card/40 p-4",
        manageable &&
          "cursor-pointer transition-colors hover:border-brand-coral/40 hover:bg-card/70",
        !manageable &&
          matchStarted &&
          prediction.status === "open" &&
          "opacity-70",
      )}
      {...(manageable
        ? {
            role: "link" as const,
            tabIndex: 0,
            onClick: () => router.push(manageHref),
            onKeyDown: (event: React.KeyboardEvent) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(manageHref);
              }
            },
          }
        : {})}
    >
      {cardBody}
    </article>
  );
}
