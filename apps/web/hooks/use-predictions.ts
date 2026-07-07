"use client";

import { useQuery } from "convex/react";

import { api } from "@goalaxify/convex/_generated/api";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { isConvexConfigured } from "@/lib/env/runtime";

export function usePredictions(status?: "open" | "locked" | "won" | "lost" | "settled") {
  const { walletPubkey, isConnected } = useWalletSession();
  const enabled = isConvexConfigured() && isConnected && !!walletPubkey;

  const predictions = useQuery(
    api.predictions.listByWallet,
    enabled
      ? {
          walletPubkey: walletPubkey!,
          status,
        }
      : "skip",
  );

  return {
    predictions: predictions ?? [],
    loading: enabled && predictions === undefined,
    isEmpty: enabled && predictions !== undefined && predictions.length === 0,
  };
}

export function useClaimablePredictions() {
  const { predictions, loading } = usePredictions("won");

  return {
    predictions,
    loading,
    count: predictions.length,
  };
}
