"use client";

import { useCallback, useState } from "react";

import type { Id } from "@goalaxify/convex/_generated/dataModel";
import { appToast } from "@/lib/toast";

export function useCancelPrediction() {
  const [cancellingId, setCancellingId] = useState<Id<"predictions"> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const cancelPrediction = useCallback(
    async (
      predictionId: Id<"predictions">,
      walletPubkey: string,
      reason: "cancel" | "replace" = "cancel",
    ) => {
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
          throw new Error(payload.error ?? "Cancel failed");
        }

        appToast.genericSuccess(
          reason === "replace"
            ? "Previous bet replaced — refund sent"
            : `Bet cancelled — ${payload.refundAmount?.toFixed(3) ?? ""} ${payload.refundToken ?? "SOL"} refunded`,
        );
        return payload.txSig;
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Failed to cancel bet";
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
