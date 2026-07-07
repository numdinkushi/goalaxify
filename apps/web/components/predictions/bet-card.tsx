"use client";

import type { Doc } from "@goalaxify/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Mic,
  Trophy,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchTeamTitle, OutcomeLabel } from "@/components/match/match-labels";
import { AppRoute } from "@/lib/enums";
import { useTranslation } from "@/hooks/use-translation";
import { getSolanaNetwork } from "@/lib/solana/config";
import {
  canManageBet,
  formatBetKickoff,
  formatFinalScore,
  isMatchFinishedForBet,
  isMatchStarted,
  resolveBetKickoff,
  resolveBetPayout,
  resolveBetVerdict,
  type BetStatusMeta,
} from "@/lib/utils/bet-display";
import { formatTokenAmount } from "@/lib/utils/prediction";
import type { MatchOutcome } from "@goalaxify/domain";
import { cn } from "@/lib/utils";

type BetCardProps = {
  prediction: Doc<"predictions">;
  fixtureMeta?: {
    kickoffAt?: string;
    round?: string;
    status?: string;
    homeScore?: number;
    awayScore?: number;
    winningSelection?: string;
  };
  onClaim?: () => void;
  claiming?: boolean;
};

const STATUS_BADGE: Record<
  BetStatusMeta["tone"],
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

const BET_STATUS_KEY_MAP = {
  open: "bets.status.open",
  locked: "bets.status.locked",
  lockedFinished: "bets.status.lockedFinished",
  won: "bets.status.won",
  lost: "bets.status.lost",
  settled: "bets.status.settled",
  cancelled: "bets.status.cancelled",
  replaced: "bets.status.replaced",
} as const;

function getTranslatedBetStatus(
  statusKey: keyof typeof BET_STATUS_KEY_MAP,
  t: (key: string, params?: Record<string, string | number>) => string,
): BetStatusMeta {
  const key = BET_STATUS_KEY_MAP[statusKey];
  return {
    label: t(`${key}.label`),
    description: t(`${key}.description`),
    tone:
      statusKey === "open"
        ? "open"
        : statusKey === "locked" || statusKey === "lockedFinished"
          ? "pending"
          : statusKey,
  };
}

export function BetCard({
  prediction,
  fixtureMeta,
  onClaim,
  claiming = false,
}: BetCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const kickoff = resolveBetKickoff(prediction, fixtureMeta);
  const kickoffDisplay = formatBetKickoff(kickoff.kickoffAt);
  const matchFinished = isMatchFinishedForBet(prediction, kickoff.matchStatus);
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
  const statusKey =
    prediction.status === "locked" && matchFinished
      ? "lockedFinished"
      : (prediction.status as keyof typeof BET_STATUS_KEY_MAP);
  const status = getTranslatedBetStatus(statusKey, t);
  const payout = resolveBetPayout(prediction);
  const verdict = resolveBetVerdict(prediction, fixtureMeta?.winningSelection);
  const finalScore = formatFinalScore(
    fixtureMeta?.homeScore,
    fixtureMeta?.awayScore,
  );
  const network = getSolanaNetwork();
  const explorerCluster =
    network === "mainnet-beta" ? "" : `?cluster=${network}`;

  const manageHref = `${AppRoute.Booth}?fixture=${prediction.fixtureId}&prediction=${prediction._id}`;

  const showVerdict =
    verdict.isCorrect !== null &&
    (prediction.status === "won" ||
      prediction.status === "lost" ||
      prediction.status === "settled" ||
      (prediction.status === "locked" && matchFinished && verdict.winningLabel));

  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold">
            <MatchTeamTitle
              homeTeam={prediction.homeTeam}
              awayTeam={prediction.awayTeam}
            />
          </p>
          {kickoff.round ? (
            <p className="text-xs text-muted-foreground">{kickoff.round}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">{status.description}</p>
        </div>
        <Badge variant={STATUS_BADGE[status.tone]}>{status.label}</Badge>
      </div>

      {showVerdict ? (
        <div
          className={cn(
            "mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm",
            verdict.isCorrect
              ? "border-brand-mint/30 bg-brand-mint/10 text-brand-mint"
              : "border-border/80 bg-muted/30 text-muted-foreground",
          )}
        >
          {verdict.isCorrect ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <p className="flex flex-wrap items-center gap-1">
            {verdict.isCorrect ? (
              <>
                <span>{t("bets.pickCorrect")} —</span>
                <OutcomeLabel outcome={prediction.selection as MatchOutcome} />
              </>
            ) : (
              <>
                <span>{t("bets.pickMissedPrefix")}</span>
                {fixtureMeta?.winningSelection ? (
                  <OutcomeLabel
                    outcome={fixtureMeta.winningSelection as MatchOutcome}
                  />
                ) : (
                  <span>
                    {verdict.winningLabel ??
                      finalScore ??
                      t("bets.scorePending")}
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      ) : null}

      {prediction.status === "locked" && matchFinished ? (
        <p className="mt-3 text-xs text-muted-foreground">{t("bets.settling")}</p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">{t("bets.yourPick")}</p>
          <p className="mt-1 font-medium">
            <OutcomeLabel outcome={prediction.selection as MatchOutcome} />
          </p>
        </div>

        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">{t("bets.stake")}</p>
          <p className="mt-1 font-medium tabular-nums">
            {formatTokenAmount(payout.stake)} {payout.token}
          </p>
        </div>

        <div
          className={cn(
            "rounded-xl border p-3",
            prediction.status === "won" || prediction.status === "settled"
              ? "border-brand-mint/30 bg-brand-mint/5"
              : prediction.status === "lost"
                ? "border-border/80 bg-muted/20"
                : "border-brand-coral/20 bg-brand-coral/5",
          )}
        >
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {prediction.status === "won" || prediction.status === "settled" ? (
              <Trophy className="size-3.5" />
            ) : (
              <TrendingUp className="size-3.5" />
            )}
            {payout.isFinal && prediction.status !== "cancelled" && prediction.status !== "replaced"
              ? t("bets.resultPayout")
              : prediction.status === "cancelled" || prediction.status === "replaced"
                ? t("bets.refundedStake")
                : t("bets.potentialWin")}
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
            {matchFinished ? t("bets.finalScore") : t("bets.matchStarts")}
          </p>
          <p className="mt-1 font-medium">
            {matchFinished
              ? finalScore ?? t("bets.scorePending")
              : kickoffDisplay.primary}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {matchFinished
              ? kickoffDisplay.primary !== "Schedule pending"
                ? kickoffDisplay.primary
                : t("bets.finalScore")
              : matchStarted && prediction.status === "open"
                ? t("bets.matchLocked")
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
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <Button
              size="sm"
              disabled={claiming}
              onClick={(event) => {
                event.stopPropagation();
                onClaim();
              }}
            >
              {claiming ? t("bets.claiming") : t("bets.claimWinnings")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("bets.claimHint")}</p>
          </div>
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

        {prediction.claimTxSig ? (
          <a
            href={`https://explorer.solana.com/tx/${prediction.claimTxSig}${explorerCluster}`}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("bets.viewClaimTx")}
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
        (prediction.status === "won" || prediction.status === "settled") &&
          "border-brand-mint/30",
        prediction.status === "lost" && "opacity-90",
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
