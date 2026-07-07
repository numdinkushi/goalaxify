"use client";

import { useEffect, useMemo, useState } from "react";
import type { PredictionDraft, StakeToken } from "@goalaxify/domain";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OUTCOME_LABELS, type BoothContext } from "@/lib/data/types";
import type { MatchOutcome } from "@goalaxify/domain";
import {
  buildDraftFromContext,
  calculatePotentialPayout,
  formatTokenAmount,
  normalizeSelection,
} from "@/lib/utils/prediction";
import { formatMatchTitle } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type StakeConfirmDialogProps = {
  open: boolean;
  context: BoothContext;
  initialDraft?: Partial<PredictionDraft> | null;
  fromVoice?: boolean;
  onClose: () => void;
  onConfirm: (draft: PredictionDraft) => Promise<void>;
  isSubmitting?: boolean;
  isWalletReady?: boolean;
  error?: string | null;
};

const STAKE_TOKENS: StakeToken[] = ["SOL", "USDC"];

export function StakeConfirmDialog({
  open,
  context,
  initialDraft,
  fromVoice = false,
  onClose,
  onConfirm,
  isSubmitting = false,
  isWalletReady = true,
  error,
}: StakeConfirmDialogProps) {
  const baseDraft = useMemo(
    () =>
      buildDraftFromContext({
        context,
        selection: initialDraft?.selection,
        stake: initialDraft?.stake,
        stakeToken: initialDraft?.stakeToken,
        vapiCallId: initialDraft?.vapiCallId,
      }),
    [context, initialDraft],
  );

  const [selection, setSelection] = useState<MatchOutcome>(
    normalizeSelection(baseDraft.selection) ?? "home",
  );
  const [stake, setStake] = useState(baseDraft.stake);
  const [stakeToken, setStakeToken] = useState<StakeToken>(
    baseDraft.stakeToken ?? "SOL",
  );

  useEffect(() => {
    if (!open) return;
    setSelection(normalizeSelection(baseDraft.selection) ?? "home");
    setStake(baseDraft.stake);
    setStakeToken(baseDraft.stakeToken ?? "SOL");
  }, [baseDraft, open]);

  if (!open) {
    return null;
  }

  const draft: PredictionDraft = buildDraftFromContext({
    context,
    selection,
    stake,
    stakeToken,
    vapiCallId: baseDraft.vapiCallId,
  });

  const payout = calculatePotentialPayout(
    selection,
    stake,
    context.odds,
    stakeToken,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <Card className="w-full max-w-md border-border/80 shadow-xl">
        <CardContent className="space-y-5 p-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Review your bet
            </p>
            <h3 className="mt-2 text-lg font-bold">
              {formatMatchTitle(context.homeTeam, context.awayTeam)}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {fromVoice
                ? "Confirm your voice prediction and potential reward before signing on-chain."
                : "Review your pick and potential reward before signing on-chain."}
            </p>
          </div>

          {payout ? (
            <div className="rounded-2xl border border-brand-coral/25 bg-gradient-to-br from-brand-coral/10 to-brand-pastel-pink/10 p-4">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                If you win
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums">
                {formatTokenAmount(payout.payout)} {stakeToken}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Your stake</p>
                  <p className="font-medium tabular-nums">
                    {formatTokenAmount(payout.stake)} {stakeToken}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Potential profit</p>
                  <p className="font-medium tabular-nums text-brand-mint">
                    +{formatTokenAmount(payout.profit)} {stakeToken}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                TxLINE odds {payout.multiplier.toFixed(2)}× on{" "}
                {OUTCOME_LABELS[selection]}. Payout assumes a winning pick.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Live odds unavailable — you can still stake, but potential reward
              cannot be estimated yet.
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Your pick</p>
            <div className="grid grid-cols-3 gap-2">
              {(["home", "draw", "away"] as MatchOutcome[]).map((outcome) => (
                <Button
                  key={outcome}
                  type="button"
                  size="sm"
                  variant={selection === outcome ? "default" : "outline"}
                  onClick={() => setSelection(outcome)}
                  disabled={isSubmitting}
                >
                  {OUTCOME_LABELS[outcome]}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Stake amount</span>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={stake}
                onChange={(event) => setStake(Number(event.target.value))}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Token</span>
              <select
                value={stakeToken}
                onChange={(event) =>
                  setStakeToken(event.target.value as StakeToken)
                }
                disabled={isSubmitting}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              >
                {STAKE_TOKENS.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={cn("flex-1")}
              disabled={
                isSubmitting || stake <= 0 || (stakeToken === "SOL" && !isWalletReady)
              }
              onClick={() => void onConfirm({ ...draft, estimatedReturn: payout?.payout })}
            >
              {isSubmitting
                ? "Approve in Phantom…"
                : stakeToken === "SOL" && !isWalletReady
                  ? "Preparing transaction…"
                  : "Confirm & stake"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
