"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, Mic, MicOff, PhoneOff, Radio } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import type { PredictionDraft } from "@goalaxify/domain";
import type { Id } from "@goalaxify/convex/_generated/dataModel";

import {
  VoiceActionSummary,
  type VoiceActionPhase,
} from "@/components/booth/voice-action-summary";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSolanaNetwork } from "@/components/providers/solana-network-provider";
import { useCancelPrediction } from "@/hooks/use-cancel-prediction";
import { usePredictionStake } from "@/hooks/use-prediction-stake";
import { useTranslation } from "@/hooks/use-translation";
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
import { fetchWalletBalanceLamports } from "@/lib/solana/fetch-balance";
import {
  resolveAffordableStakeSol,
  solToLamports,
  STAKE_TX_FEE_BUFFER_LAMPORTS,
  parseStakeTransactionError,
  parseSettlementError,
} from "@/lib/wallet/stake-balance";
import { waitForSolBalanceAtLeast } from "@/lib/wallet/wait-for-balance";

type VoiceBoothProps = {
  context: BoothContext;
  manageBet?: BoothManageBet | null;
  boothLocked?: boolean;
  autoStartSession?: boolean;
  onSessionActiveChange?: (locked: boolean) => void;
};

export function VoiceBooth({
  context,
  manageBet,
  boothLocked = false,
  autoStartSession = false,
  onSessionActiveChange,
}: VoiceBoothProps) {
  const { t } = useTranslation();
  const { connection } = useConnection();
  const { network: solanaNetwork } = useSolanaNetwork();
  const { isConnected, walletPubkey } = useWalletSession();
  const { refresh: refreshWalletBalance } = useWalletBalance();
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

  const statusLabels: Record<BoothCallStatus, string> = {
    [BoothCallStatus.Idle]: t("booth.status.ready"),
    [BoothCallStatus.Connecting]: t("booth.status.connecting"),
    [BoothCallStatus.Active]: t("booth.status.live"),
    [BoothCallStatus.Ended]: t("booth.status.ended"),
    [BoothCallStatus.Error]: t("booth.status.unavailable"),
  };

  const executeVoiceAction = useCallback(
    async (action: BoothToolAction) => {
      if (!walletPubkey) return;

      if (boothLocked) {
        setActionError(t("booth.lockedDescription"));
        setActionPhase("error");
        return;
      }

      setActionError(null);
      setActionType(action.type);

      if (action.type === VoiceActionType.Cancel) {
        if (!manageBet) {
          setActionError("No open bet to cancel");
          setActionPhase("error");
          return;
        }

        setActionPhase("refunding");
        try {
          const refund = await cancelPrediction(
            manageBet.predictionId as Id<"predictions">,
            walletPubkey,
          );

          if (refund.refundToken === "SOL") {
            try {
              await waitForSolBalanceAtLeast(
                connection,
                new PublicKey(walletPubkey),
                1,
                refund.txSig,
              );
            } catch {
              // Refund was submitted — balance may lag on devnet.
            }
            await refreshWalletBalance();
          }

          setActionPhase("done");
          setSuccessMessage(
            `Bet cancelled — ${manageBet.stakeAmount} ${manageBet.stakeToken} refunded`,
          );
        } catch (cause) {
          setActionError(
            parseSettlementError(
              cause instanceof Error ? cause.message : "Cancel failed",
            ),
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
          setActionPhase("refunding");
          const refund = await cancelPrediction(
            manageBet.predictionId as Id<"predictions">,
            walletPubkey,
            { reason: "replace", silent: true },
          );

          const requiredLamports =
            solToLamports(draft.stake) + STAKE_TX_FEE_BUFFER_LAMPORTS;

          await waitForSolBalanceAtLeast(
            connection,
            new PublicKey(walletPubkey),
            requiredLamports,
            refund.txSig,
          );
          await refreshWalletBalance();
        }

        let stakeDraft = draft;
        if ((draft.stakeToken ?? "SOL") === "SOL") {
          const balanceLamports = await fetchWalletBalanceLamports(
            walletPubkey,
            solanaNetwork,
          );
          const { stakeSol } = resolveAffordableStakeSol(
            draft.stake,
            balanceLamports,
          );
          stakeDraft = {
            ...draft,
            stake: stakeSol,
            estimatedReturn: calculatePotentialPayout(
              draft.selection as MatchOutcome,
              stakeSol,
              context.odds,
              "SOL",
            )?.payout,
          };
          setPendingDraft(stakeDraft);
        }

        await prepareStakeBlockhash();
        setActionPhase("signing");
        await submitStake(
          stakeDraft,
          action.type === VoiceActionType.Replace && manageBet
            ? { supersedesPredictionId: manageBet.predictionId as Id<"predictions"> }
            : undefined,
        );
        setActionPhase("done");
        setSuccessMessage(
          `${OUTCOME_LABELS[stakeDraft.selection as MatchOutcome]} · ${stakeDraft.stake} ${stakeDraft.stakeToken ?? "SOL"} staked`,
        );
      } catch (cause) {
        const raw =
          cause instanceof Error ? cause.message : "Transaction failed";
        const isRefundStep =
          action.type === VoiceActionType.Replace &&
          /insufficient lamports|simulation failed|settlement pool/i.test(raw);

        setActionError(
          isRefundStep
            ? parseSettlementError(raw)
            : parseStakeTransactionError(cause, {
                intendedStakeSol:
                  (draft.stakeToken ?? "SOL") === "SOL"
                    ? draft.stake
                    : undefined,
              }),
        );
        setActionPhase("error");
      }
    },
    [
      boothLocked,
      cancelPrediction,
      connection,
      context.odds,
      manageBet,
      prepareStakeBlockhash,
      refreshWalletBalance,
      solanaNetwork,
      submitStake,
      t,
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
    actionPhase === "refunding" ||
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
    if (boothLocked) return;

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
                  {t("booth.voiceTitle")}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xl">
                  <span aria-hidden>{context.homeFlag}</span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {t("match.vs")}
                  </span>
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
                    ? t("booth.status.signing")
                    : actionPhase === "refunding"
                      ? t("booth.status.refunding")
                      : t("booth.status.processing")
                  : statusLabels[booth.status]}
              </Badge>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {boothLocked
                ? t("booth.lockedDescription")
                : manageBet
                  ? t("booth.manageHint")
                  : t("booth.stakeHint")}
            </p>

            {actionPhase === "refunding" && (
              <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-sm">
                <Loader2 className="size-4 animate-spin text-brand-coral" />
                {t("booth.refundingMessage")}
              </div>
            )}

            {actionPhase === "signing" && (
              <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-sm">
                <Loader2 className="size-4 animate-spin text-brand-coral" />
                {t("booth.signingMessage")}
              </div>
            )}

            {actionPhase === "done" && successMessage && (
              <div className="flex items-start gap-2 rounded-xl border border-brand-mint/30 bg-brand-mint/10 px-4 py-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-mint" />
                <div>
                  <p className="font-medium">{t("booth.done")}</p>
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
              {!boothLocked &&
                !booth.isActive &&
                !booth.isConnecting &&
                !isBusy && (
                <Button
                  onClick={startSession}
                  disabled={!booth.vapiEnabled || !isConnected}
                >
                  <Mic className="size-4" />
                  {manageBet ? t("booth.manageByVoice") : t("booth.startSession")}
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
                    {booth.isMuted ? t("booth.unmute") : t("booth.mute")}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={booth.endSession}
                  >
                    <PhoneOff className="size-4" />
                    {t("booth.endSession")}
                  </Button>
                </>
              )}

              {booth.status === BoothCallStatus.Ended && !isBusy && (
                <Button variant="outline" onClick={resetSession}>
                  {t("booth.newSession")}
                </Button>
              )}
            </div>

            {walletPubkey && (
              <p className="text-xs text-muted-foreground">
                {t("booth.linkedWallet")}{" "}
                <span className="font-mono">{walletPubkey}</span>
              </p>
            )}

            {booth.callId && (
              <p className="text-xs text-muted-foreground">
                {t("booth.callId")} <span className="font-mono">{booth.callId}</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Link
          href={AppRoute.Live}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <Radio className="size-4" />
          {t("booth.viewLiveMoments")}
        </Link>
      </section>
    </>
  );
}
