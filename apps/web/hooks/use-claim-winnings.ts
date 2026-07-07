"use client";

import { useCallback, useState } from "react";

import type { Id } from "@goalaxify/convex/_generated/dataModel";
import { appToast } from "@/lib/toast";

export function useClaimWinnings() {
  const [claimingId, setClaimingId] = useState<Id<"predictions"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const claimPrediction = useCallback(
    async (predictionId: Id<"predictions">, walletPubkey: string) => {
      setClaimingId(predictionId);
      setError(null);

      try {
        const response = await fetch("/api/settlement/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ predictionId, walletPubkey }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          txSig?: string;
          error?: string;
        };

        if (!response.ok || !payload.ok || !payload.txSig) {
          throw new Error(payload.error ?? "Claim failed");
        }

        appToast.genericSuccess("Winnings claimed");
        return payload.txSig;
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Failed to claim winnings";
        setError(message);
        appToast.genericError(message);
        throw cause;
      } finally {
        setClaimingId(null);
      }
    },
    [],
  );

  return {
    claimPrediction,
    claimingId,
    error,
    isClaiming: claimingId !== null,
  };
}
