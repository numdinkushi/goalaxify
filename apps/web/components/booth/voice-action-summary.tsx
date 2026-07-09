"use client";

import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { OUTCOME_LABELS } from "@/lib/data/types";
import type { BoothManageBet } from "@/lib/data/types";
import { VoiceActionType } from "@/lib/enums";
import type { MatchOutcome } from "@goalaxify/domain";
import type { PredictionDraft } from "@goalaxify/domain";
import {
  calculatePotentialPayout,
  formatTokenAmount,
} from "@/lib/utils/prediction";
import { MatchTeamsTitle } from "@/components/match/match-teams-title";
import type { BoothContext } from "@/lib/data/types";
import type { ThreeWayOdds } from "@goalaxify/domain";

export type VoiceActionPhase =
  | "idle"
  | "listening"
  | "refunding"
  | "executing"
  | "signing"
  | "done"
  | "error";

type VoiceActionSummaryProps = {
  context: BoothContext;
  phase: VoiceActionPhase;
  actionType?: VoiceActionType;
  draft?: PredictionDraft | null;
  manageBet?: BoothManageBet | null;
  error?: string | null;
};

function resolvePayout(
  selection: string,
  stake: number,
  stakeToken: "SOL" | "USDC",
  odds?: ThreeWayOdds,
) {
  return calculatePotentialPayout(
    selection as MatchOutcome,
    stake,
    odds,
    stakeToken,
  );
}

export function VoiceActionSummary({
  context,
  phase,
  actionType,
  draft,
  manageBet,
  error,
}: VoiceActionSummaryProps) {
  const showPanel =
    phase !== "idle" || manageBet || draft || actionType !== undefined;

  if (!showPanel) return null;

  const token = draft?.stakeToken ?? manageBet?.stakeToken ?? "SOL";
  const stake = draft?.stake ?? manageBet?.stakeAmount ?? 0;
  const selection = draft?.selection ?? manageBet?.selection ?? "home";
  const payout = draft
    ? resolvePayout(
        draft.selection,
        draft.stake,
        draft.stakeToken ?? "SOL",
        context.odds,
      )
    : manageBet?.estimatedReturn
      ? {
          payout: manageBet.estimatedReturn,
          profit: manageBet.estimatedReturn - manageBet.stakeAmount,
        }
      : resolvePayout(selection, stake, token, context.odds);

  const actionLabel =
    actionType === VoiceActionType.Cancel
      ? "Cancel bet"
      : actionType === VoiceActionType.Replace
        ? "Replace bet"
        : actionType === VoiceActionType.Stake
          ? "Place bet"
          : manageBet
            ? "Manage bet"
            : "Voice confirmation";

  const phaseLabel =
    phase === "listening"
      ? "Confirm with your voice — the announcer will proceed automatically."
      : phase === "refunding"
        ? "Sending your full refund from the pot…"
        : phase === "executing"
          ? "Processing your request…"
          : phase === "signing"
            ? "Approve in Phantom to sign on-chain…"
            : phase === "done"
              ? "Done."
              : phase === "error"
                ? "Something went wrong."
                : manageBet
                  ? "Say cancel or replace — details below."
                  : "Stake details will appear here during your call.";

  return (
    <Card className="border-brand-coral/25 bg-gradient-to-br from-brand-coral/5 to-transparent">
      <CardContent className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {actionLabel}
          </p>
          <h3 className="mt-1 text-lg font-bold">
            <MatchTeamsTitle home={context.homeTeam} away={context.awayTeam} />
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{phaseLabel}</p>
        </div>

        {(phase === "executing" || phase === "refunding" || phase === "signing") && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-brand-coral" />
            {phase === "signing"
              ? "Waiting for wallet approval…"
              : phase === "refunding"
                ? "Waiting for refund to land in your wallet…"
                : "Executing on-chain…"}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {actionType !== VoiceActionType.Cancel && draft ? (
            <>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Pick</p>
                <p className="mt-1 font-medium">
                  {OUTCOME_LABELS[draft.selection as MatchOutcome] ??
                    draft.selection}
                </p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Stake</p>
                <p className="mt-1 font-medium tabular-nums">
                  {formatTokenAmount(draft.stake)} {token}
                </p>
              </div>
              {payout ? (
                <div className="rounded-xl border border-brand-coral/20 bg-brand-coral/5 p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">
                    Potential win if your pick hits
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {formatTokenAmount(payout.payout)} {token}
                  </p>
                  <p className="mt-0.5 text-sm text-brand-mint tabular-nums">
                    +{formatTokenAmount(payout.profit)} profit
                  </p>
                </div>
              ) : null}
            </>
          ) : null}

          {actionType === VoiceActionType.Cancel && manageBet ? (
            <div className="rounded-xl border border-brand-mint/20 bg-brand-mint/5 p-3 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Full refund</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {formatTokenAmount(manageBet.stakeAmount)} {manageBet.stakeToken}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Returned to your wallet — no fee
              </p>
            </div>
          ) : null}

          {manageBet && !draft && actionType !== VoiceActionType.Cancel ? (
            <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Current bet</p>
              <p className="mt-1 font-medium">
                {OUTCOME_LABELS[manageBet.selection as MatchOutcome] ??
                  manageBet.selection}{" "}
                · {formatTokenAmount(manageBet.stakeAmount)} {manageBet.stakeToken}
              </p>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
