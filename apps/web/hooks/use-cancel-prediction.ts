"use client";

import { useCallback, useState } from "react";

import type { Id } from "@goalaxify/convex/_generated/dataModel";
import { appToast } from "@/lib/toast";
import { parseSettlementError } from "@/lib/wallet/stake-balance";

export type CancelPredictionResult = {
  txSig: string;
  refundAmount: number;
  refundToken: string;
};

type CancelOptions = {
  reason?: "cancel" | "replace";
  /** Skip success toast — use when cancel is step 1 of a replace flow. */
  silent?: boolean;
};

export function useCancelPrediction() {
  const [cancellingId, setCancellingId] = useState<Id<"predictions"> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const cancelPrediction = useCallback(
    async (
      predictionId: Id<"predictions">,
      walletPubkey: string,
      reasonOrOptions: "cancel" | "replace" | CancelOptions = "cancel",
    ): Promise<CancelPredictionResult> => {
      const options: CancelOptions =
        reasonOrOptions === "cancel" || reasonOrOptions === "replace"
          ? { reason: reasonOrOptions }
          : reasonOrOptions;
      const reason = options.reason ?? "cancel";

      setCancellingId(predictionId);
      setError(null);

      try {
        const response = await fetch("/api/settlement/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ predictionId, walletPubkey, reason }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          txSig?: string;
          refundAmount?: number;
          refundToken?: string;
          error?: string;
        };

        if (!response.ok || !payload.ok || !payload.txSig) {
          throw new Error(
            parseSettlementError(payload.error ?? "Cancel failed"),
          );
        }

        const result: CancelPredictionResult = {
          txSig: payload.txSig,
          refundAmount: payload.refundAmount ?? 0,
          refundToken: payload.refundToken ?? "SOL",
        };

        if (!options.silent) {
          appToast.genericSuccess(
            reason === "replace"
              ? "Previous bet replaced — refund sent"
              : `Bet cancelled — ${result.refundAmount.toFixed(3)} ${result.refundToken} refunded`,
          );
        }

        return result;
      } catch (cause) {
        const message = parseSettlementError(
          cause instanceof Error ? cause.message : "Failed to cancel bet",
        );
        setError(message);
        appToast.genericError(message);
        throw cause;
      } finally {
        setCancellingId(null);
      }
    },
    [],
  );

  return {
    cancelPrediction,
    cancellingId,
    error,
    isCancelling: cancellingId !== null,
  };
}
