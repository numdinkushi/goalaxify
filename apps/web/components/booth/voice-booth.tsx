"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, Mic, MicOff, PhoneOff, Radio } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PredictionDraft } from "@goalaxify/domain";
import type { Id } from "@goalaxify/convex/_generated/dataModel";

import {
  VoiceActionSummary,
  type VoiceActionPhase,
} from "@/components/booth/voice-action-summary";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCancelPrediction } from "@/hooks/use-cancel-prediction";
import { usePredictionStake } from "@/hooks/use-prediction-stake";
import { useVapiBooth } from "@/hooks/use-vapi-booth";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useWalletSession } from "@/hooks/use-wallet-session";
import type { BoothContext, BoothManageBet } from "@/lib/data/types";
import {
  AppRoute,
  BoothCallStatus,
  BoothSessionMode,
  VoiceActionType,
} from "@/lib/enums";
import { OUTCOME_LABELS } from "@/lib/data/types";
import type { MatchOutcome } from "@goalaxify/domain";
import { formatKickoffTime, formatMatchTitle } from "@/lib/utils/format";
import {
  calculatePotentialPayout,
} from "@/lib/utils/prediction";
import { formatScheduleDayLabel } from "@/lib/utils/schedule";
import type { BoothToolAction } from "@/lib/vapi/parse-tool-call";
import {
  buildBoothAutoStartKey,
  claimBoothAutoStart,
  releaseBoothAutoStart,
} from "@/lib/vapi/auto-start-guard";
import { cn } from "@/lib/utils";
import {
  getInsufficientStakeMessage,
  parseStakeTransactionError,
} from "@/lib/wallet/stake-balance";

type VoiceBoothProps = {
  context: BoothContext;
  manageBet?: BoothManageBet | null;
  autoStartSession?: boolean;
  onSessionActiveChange?: (locked: boolean) => void;
};

const STATUS_LABELS: Record<BoothCallStatus, string> = {
  [BoothCallStatus.Idle]: "Ready",
  [BoothCallStatus.Connecting]: "Connecting…",
  [BoothCallStatus.Active]: "Live",
  [BoothCallStatus.Ended]: "Session ended",
  [BoothCallStatus.Error]: "Unavailable",
};

export function VoiceBooth({
  context,
  manageBet,
  autoStartSession = false,
  onSessionActiveChange,
}: VoiceBoothProps) {
  const { isConnected, walletPubkey } = useWalletSession();
  const { lamports: walletLamports } = useWalletBalance();
  const { submitStake, prepareStakeBlockhash } = usePredictionStake();
  const { cancelPrediction } = useCancelPrediction();

  const [actionPhase, setActionPhase] = useState<VoiceActionPhase>("idle");
  const [actionType, setActionType] = useState<VoiceActionType | undefined>();
  const [pendingDraft, setPendingDraft] = useState<PredictionDraft | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const autoStartScheduledRef = useRef(false);

  const mode = manageBet ? BoothSessionMode.Manage : BoothSessionMode.Stake;
  const autoStartKey = buildBoothAutoStartKey({
    fixtureId: context.fixtureId,
    managePredictionId: manageBet?.predictionId,
  });

  const executeVoiceAction = useCallback(
    async (action: BoothToolAction) => {
      if (!walletPubkey) return;

      setActionError(null);
      setActionType(action.type);

      if (action.type === VoiceActionType.Cancel) {
        if (!manageBet) {
          setActionError("No open bet to cancel");
          setActionPhase("error");
          return;
        }

        setActionPhase("executing");
        try {
          await cancelPrediction(
            manageBet.predictionId as Id<"predictions">,
            walletPubkey,
          );
          setActionPhase("done");
          setSuccessMessage(
            `Bet cancelled — ${manageBet.stakeAmount} ${manageBet.stakeToken} refunded`,
          );
        } catch (cause) {
          setActionError(
            cause instanceof Error ? cause.message : "Cancel failed",
          );
          setActionPhase("error");
        }
        return;
      }

      const draft = {
        ...action.draft,
        estimatedReturn: calculatePotentialPayout(
          action.draft.selection as MatchOutcome,
          action.draft.stake,
          context.odds,
          action.draft.stakeToken ?? "SOL",
        )?.payout,
      };

      setPendingDraft(draft);
      setActionPhase("executing");

      try {
        if (action.type === VoiceActionType.Replace && manageBet) {
          await cancelPrediction(
            manageBet.predictionId as Id<"predictions">,
            walletPubkey,
            "replace",
          );
        }

        const stakeToken = draft.stakeToken ?? "SOL";
        if (
          stakeToken === "SOL" &&
          walletLamports !== null &&
          draft.stake > 0
        ) {
          const insufficientMessage = getInsufficientStakeMessage(
            draft.stake,
            walletLamports,
          );
          if (insufficientMessage) {
            throw new Error(insufficientMessage);
          }
        }

        setActionPhase("signing");
        await submitStake(
          draft,
          action.type === VoiceActionType.Replace && manageBet
            ? { supersedesPredictionId: manageBet.predictionId as Id<"predictions"> }
            : undefined,
        );
        setActionPhase("done");
        setSuccessMessage(
          `${OUTCOME_LABELS[draft.selection as MatchOutcome]} · ${draft.stake} ${draft.stakeToken ?? "SOL"} staked`,
        );
      } catch (cause) {
        setActionError(
          parseStakeTransactionError(cause, {
            intendedStakeSol:
              (draft.stakeToken ?? "SOL") === "SOL" ? draft.stake : undefined,
          }),
        );
        setActionPhase("error");
      }
    },
    [
      cancelPrediction,
      context.odds,
      manageBet,
      submitStake,
      walletLamports,
      walletPubkey,
    ],
  );

  const booth = useVapiBooth({
    context,
    walletPubkey,
    mode,
    manageBet,
    onVoiceAction: (action) => {
      void executeVoiceAction(action);
    },
  });

  const kickoffLabel = context.kickoffAt
    ? `${formatScheduleDayLabel(context.kickoffAt)} · ${formatKickoffTime(context.kickoffAt)}`
    : null;

  const isBusy =
    actionPhase === "executing" ||
    actionPhase === "signing" ||
    booth.isConnecting;

  useEffect(() => {
    onSessionActiveChange?.(booth.isActive || booth.isConnecting || isBusy);
  }, [booth.isActive, booth.isConnecting, isBusy, onSessionActiveChange]);

  useEffect(() => {
    if (!booth.isActive && !booth.isConnecting) return;
    void prepareStakeBlockhash();
    const intervalId = window.setInterval(() => {
      void prepareStakeBlockhash();
    }, 30_000);
    return () => window.clearInterval(intervalId);
  }, [booth.isActive, booth.isConnecting, prepareStakeBlockhash]);

  useEffect(() => {
    if (
      autoStartScheduledRef.current ||
      !autoStartSession ||
      !manageBet ||
      !isConnected ||
      !booth.vapiEnabled
    ) {
      return;
    }

    autoStartScheduledRef.current = true;

    const timerId = window.setTimeout(() => {
      if (!claimBoothAutoStart(autoStartKey)) {
        return;
      }

      setActionPhase("listening");
      void booth.startSession().then((started) => {
        if (!started) {
          setActionPhase("idle");
        }
      });
    }, 800);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    autoStartKey,
    autoStartSession,
    booth.startSession,
    booth.vapiEnabled,
    isConnected,
    manageBet,
  ]);

  const startSession = () => {
    setActionPhase("listening");
    setActionError(null);
    setSuccessMessage(null);
    setPendingDraft(null);
    setActionType(undefined);
    void booth.startSession().then((started) => {
      if (!started) {
        setActionPhase("idle");
      }
    });
  };

  const resetSession = () => {
    autoStartScheduledRef.current = false;
    releaseBoothAutoStart(autoStartKey);
    setActionPhase("idle");
    setActionError(null);
    setSuccessMessage(null);
    setPendingDraft(null);
    setActionType(undefined);
    booth.reset();
  };

  useEffect(() => {
    if (!booth.error) {
      return;
    }

    setActionPhase("idle");
    setActionError((current) => current ?? booth.error);
  }, [booth.error]);

  const connectionError = booth.error;
  const actionOnlyError =
    actionError && actionError !== connectionError ? actionError : null;

  const summaryPhase: VoiceActionPhase =
    booth.isActive || booth.isConnecting
      ? "listening"
      : actionPhase;

  return (
    <>
      <section className="space-y-3">
        <VoiceActionSummary
          context={context}
          phase={summaryPhase}
          actionType={actionType}
          draft={pendingDraft}
          manageBet={manageBet}
          error={actionOnlyError ?? undefined}
        />

        <Card className="overflow-hidden border-border/80">
          <div className="h-1.5 bg-gradient-to-r from-brand-coral to-brand-pastel-pink" />
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Voice booth
                </p>
                <div className="mt-2 flex items-center gap-2 text-xl">
                  <span aria-hidden>{context.homeFlag}</span>
                  <span className="text-sm font-semibold text-muted-foreground">vs</span>
                  <span aria-hidden>{context.awayFlag}</span>
                </div>
                <h2 className="mt-2 text-xl font-bold">
                  {formatMatchTitle(context.homeTeam, context.awayTeam)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{context.round}</p>
                {kickoffLabel ? (
                  <p className="mt-1 text-xs text-muted-foreground">{kickoffLabel}</p>
                ) : null}
              </div>
              <Badge variant={booth.isActive ? "live" : "outline"}>
                {isBusy
                  ? actionPhase === "signing"
                    ? "Signing…"
                    : "Processing…"
                  : STATUS_LABELS[booth.status]}
              </Badge>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {manageBet
                ? "Talk to the announcer to cancel for a full refund or replace your bet. Voice confirmation replaces the review step — Phantom opens only when a new stake needs signing."
                : "Talk your prediction to the stadium announcer. Confirm by voice — once you agree, the app stakes automatically (Phantom opens to sign)."}
            </p>

            {actionPhase === "signing" && (
              <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-sm">
                <Loader2 className="size-4 animate-spin text-brand-coral" />
                Approve in Phantom to sign your stake…
              </div>
            )}

            {actionPhase === "done" && successMessage && (
              <div className="flex items-start gap-2 rounded-xl border border-brand-mint/30 bg-brand-mint/10 px-4 py-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-mint" />
                <div>
                  <p className="font-medium">Done</p>
                  <p className="text-muted-foreground">{successMessage}</p>
                </div>
              </div>
            )}

            {booth.error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {booth.error}
                {booth.isBillingError && (
                  <p className="mt-1 text-xs opacity-80">
                    Add credits at dashboard.vapi.ai to enable voice sessions.
                  </p>
                )}
                {booth.isMicError && (
                  <p className="mt-1 text-xs opacity-80">
                    Allow microphone access in your browser settings.
                  </p>
                )}
                {booth.isInterruptedError && (
                  <p className="mt-1 text-xs opacity-80">
                    If you had another booth tab open, close it first, then retry.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {!booth.isActive && !booth.isConnecting && !isBusy && (
                <Button
                  onClick={startSession}
                  disabled={!booth.vapiEnabled || !isConnected}
                >
                  <Mic className="size-4" />
                  {manageBet ? "Manage bet by voice" : "Start voice session"}
                </Button>
              )}

              {(booth.isActive || booth.isConnecting) && (
                <>
                  <Button variant="secondary" onClick={booth.toggleMute}>
                    {booth.isMuted ? (
                      <MicOff className="size-4" />
                    ) : (
                      <Mic className="size-4" />
                    )}
                    {booth.isMuted ? "Unmute" : "Mute"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={booth.endSession}
                  >
                    <PhoneOff className="size-4" />
                    End session
                  </Button>
                </>
              )}

              {booth.status === BoothCallStatus.Ended && !isBusy && (
                <Button variant="outline" onClick={resetSession}>
                  New session
                </Button>
              )}
            </div>

            {walletPubkey && (
              <p className="text-xs text-muted-foreground">
                Linked wallet:{" "}
                <span className="font-mono">{walletPubkey}</span>
              </p>
            )}

            {booth.callId && (
              <p className="text-xs text-muted-foreground">
                Call ID: <span className="font-mono">{booth.callId}</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Link
          href={AppRoute.Live}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <Radio className="size-4" />
          View live moments
        </Link>
      </section>
    </>
  );
}
