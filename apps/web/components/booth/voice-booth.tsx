"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, Mic, MicOff, PhoneOff, Radio } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PredictionDraft } from "@goalaxify/domain";

import { StakeConfirmDialog } from "@/components/booth/stake-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePredictionStake } from "@/hooks/use-prediction-stake";
import { useVapiBooth } from "@/hooks/use-vapi-booth";
import { useWalletSession } from "@/hooks/use-wallet-session";
import type { BoothContext } from "@/lib/data/types";
import { BoothCallStatus } from "@/lib/enums";
import { AppRoute } from "@/lib/enums";
import { OUTCOME_LABELS } from "@/lib/data/types";
import type { MatchOutcome } from "@goalaxify/domain";
import { formatKickoffTime, formatMatchTitle } from "@/lib/utils/format";
import { buildDraftFromContext } from "@/lib/utils/prediction";
import { formatScheduleDayLabel } from "@/lib/utils/schedule";
import { cn } from "@/lib/utils";

type VoiceBoothProps = {
  context: BoothContext;
  onSessionActiveChange?: (locked: boolean) => void;
};

type StakePhase = "idle" | "confirming" | "staking" | "done";

const STATUS_LABELS: Record<BoothCallStatus, string> = {
  [BoothCallStatus.Idle]: "Ready",
  [BoothCallStatus.Connecting]: "Connecting…",
  [BoothCallStatus.Active]: "Live",
  [BoothCallStatus.Ended]: "Session ended",
  [BoothCallStatus.Error]: "Unavailable",
};

export function VoiceBooth({ context, onSessionActiveChange }: VoiceBoothProps) {
  const { isConnected, walletPubkey } = useWalletSession();
  const { submitStake, prepareStakeBlockhash, isBlockhashReady, isStaking, error: stakeError } = usePredictionStake();
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [stakePhase, setStakePhase] = useState<StakePhase>("idle");
  const [endedCallId, setEndedCallId] = useState<string | null>(null);
  const [lastCapturedDraft, setLastCapturedDraft] = useState<PredictionDraft | null>(null);
  const [fromVoiceCapture, setFromVoiceCapture] = useState(false);
  const voiceCapturedRef = useRef(false);

  const openReviewDialog = useCallback((draft: PredictionDraft, fromVoice: boolean) => {
    setLastCapturedDraft(draft);
    setFromVoiceCapture(fromVoice);
    setStakePhase("confirming");
    setStakeDialogOpen(true);
  }, []);

  const handlePredictionSubmit = useCallback(
    (draft: PredictionDraft) => {
      voiceCapturedRef.current = true;
      openReviewDialog(draft, true);
    },
    [openReviewDialog],
  );

  const handleSessionEnded = useCallback(
    (callId?: string) => {
      setEndedCallId(callId ?? null);
      if (!voiceCapturedRef.current) {
        openReviewDialog(
          buildDraftFromContext({
            context,
            vapiCallId: callId,
          }),
          false,
        );
      }
    },
    [context, openReviewDialog],
  );

  const booth = useVapiBooth({
    context,
    walletPubkey,
    onSessionEnded: handleSessionEnded,
    onPredictionSubmit: handlePredictionSubmit,
  });

  const kickoffLabel = context.kickoffAt
    ? `${formatScheduleDayLabel(context.kickoffAt)} · ${formatKickoffTime(context.kickoffAt)}`
    : null;

  useEffect(() => {
    onSessionActiveChange?.(
      booth.isActive || booth.isConnecting || stakePhase === "staking",
    );
  }, [booth.isActive, booth.isConnecting, onSessionActiveChange, stakePhase]);

  useEffect(() => {
    if (!stakeDialogOpen) return;
    void prepareStakeBlockhash();
    const intervalId = window.setInterval(() => {
      void prepareStakeBlockhash();
    }, 30_000);
    return () => window.clearInterval(intervalId);
  }, [prepareStakeBlockhash, stakeDialogOpen]);

  const initialDraft =
    lastCapturedDraft ??
    booth.capturedDraft ??
    buildDraftFromContext({
      context,
      vapiCallId: endedCallId ?? booth.callId ?? undefined,
    });

  const resetSession = () => {
    voiceCapturedRef.current = false;
    setStakePhase("idle");
    setLastCapturedDraft(null);
    setFromVoiceCapture(false);
    setStakeDialogOpen(false);
    booth.reset();
  };

  return (
    <>
      <section className="space-y-3">
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
                {stakePhase === "staking"
                  ? "Staking…"
                  : STATUS_LABELS[booth.status]}
              </Badge>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Talk your prediction to the stadium announcer. After the call, you’ll
              review your potential reward, then confirm to stake on-chain.
            </p>

            {stakePhase === "staking" && (
              <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-sm">
                <Loader2 className="size-4 animate-spin text-brand-coral" />
                Opening Phantom to sign your stake…
              </div>
            )}

            {stakePhase === "done" && lastCapturedDraft && (
              <div className="flex items-start gap-2 rounded-xl border border-brand-mint/30 bg-brand-mint/10 px-4 py-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-mint" />
                <div>
                  <p className="font-medium">Bet placed</p>
                  <p className="text-muted-foreground">
                    {OUTCOME_LABELS[lastCapturedDraft.selection as MatchOutcome]} ·{" "}
                    {lastCapturedDraft.stake} {lastCapturedDraft.stakeToken ?? "SOL"}
                  </p>
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
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {!booth.isActive && !booth.isConnecting && stakePhase !== "staking" && (
                <Button
                  onClick={booth.startSession}
                  disabled={!booth.vapiEnabled || !isConnected}
                >
                  <Mic className="size-4" />
                  Start voice session
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

              {booth.status === BoothCallStatus.Ended && stakePhase !== "staking" && (
                <>
                  {stakePhase === "confirming" && !stakeDialogOpen && (
                    <Button onClick={() => setStakeDialogOpen(true)}>
                      Review bet
                    </Button>
                  )}
                  <Button variant="outline" onClick={resetSession}>
                    New session
                  </Button>
                </>
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

      <StakeConfirmDialog
        open={stakeDialogOpen}
        context={context}
        initialDraft={initialDraft}
        fromVoice={fromVoiceCapture}
        onClose={() => {
          setStakeDialogOpen(false);
          if (stakePhase === "confirming") {
            setStakePhase("idle");
          }
        }}
        isSubmitting={isStaking}
        isWalletReady={isBlockhashReady}
        error={stakeError}
        onConfirm={async (draft) => {
          setStakePhase("staking");
          try {
            await submitStake(draft);
            setStakeDialogOpen(false);
            setStakePhase("done");
            setLastCapturedDraft(draft);
          } catch {
            setStakePhase("confirming");
          }
        }}
      />
    </>
  );
}
