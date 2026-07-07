"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";

import { useWalletSession } from "@/hooks/use-wallet-session";
import { isConvexConfigured } from "@/lib/env/runtime";
import { api } from "@goalaxify/convex/_generated/api";

export function useWalletProfile() {
  const { walletPubkey, isSessionActive } = useWalletSession();

  const profile = useQuery(
    api.profiles.getByWallet,
    isConvexConfigured() && walletPubkey
      ? { walletPubkey }
      : "skip",
  );

  const loading = isSessionActive && walletPubkey !== null && profile === undefined;

  const displayLabel = useMemo(() => {
    if (profile?.displayName) return profile.displayName;
    if (profile?.walletName) return profile.walletName;
    return "Connected wallet";
  }, [profile?.displayName, profile?.walletName]);

  return {
    profile,
    loading,
    displayLabel,
    walletPubkey,
    isConnected: isSessionActive,
  };
}
