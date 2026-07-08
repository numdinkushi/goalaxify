"use client";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSolanaNetwork } from "@/components/providers/solana-network-provider";
import { useWalletSession } from "@/hooks/use-wallet-session";
import {
  BALANCE_FOCUS_MIN_MS,
  BALANCE_POLL_MS,
  getCachedBalance,
  isBalanceCacheStale,
  setCachedBalance,
} from "@/lib/solana/balance-cache";
import { fetchWalletBalanceLamports } from "@/lib/solana/fetch-balance";
import { formatSolBalance } from "@/lib/solana/format";

type FetchOptions = {
  background?: boolean;
};

export function useWalletBalance() {
  const { network } = useSolanaNetwork();
  const { liveWalletPubkey, isConnected } = useWalletSession();
  const [lamports, setLamports] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlightPubkeyRef = useRef<string | null>(null);
  const lastFetchAtRef = useRef(0);

  const applyCachedBalance = useCallback(
    (pubkey: string) => {
      const cached = getCachedBalance(network, pubkey);
      if (cached) {
        setLamports(cached.lamports);
        lastFetchAtRef.current = cached.fetchedAt;
        return cached;
      }

      return null;
    },
    [network],
  );

  const fetchBalance = useCallback(
    async (pubkey: string, { background = false }: FetchOptions = {}) => {
      if (inFlightPubkeyRef.current === pubkey) {
        return;
      }

      const cached = getCachedBalance(network, pubkey);
      if (background && cached && !isBalanceCacheStale(cached)) {
        return;
      }

      if (!background && !cached) {
        setIsInitialLoading(true);
      }

      inFlightPubkeyRef.current = pubkey;

      try {
        const balance = await fetchWalletBalanceLamports(pubkey, network);
        setCachedBalance(network, pubkey, balance);
        setLamports(balance);
        setError(null);
        lastFetchAtRef.current = Date.now();
      } catch {
        if (!cached) {
          setLamports(null);
          setError("Unable to load balance");
        }
      } finally {
        if (inFlightPubkeyRef.current === pubkey) {
          inFlightPubkeyRef.current = null;
        }
        setIsInitialLoading(false);
      }
    },
    [network],
  );

  useEffect(() => {
    if (!isConnected || !liveWalletPubkey) {
      setLamports(null);
      setIsInitialLoading(false);
      setError(null);
      return;
    }

    const cached = applyCachedBalance(liveWalletPubkey);
    const shouldFetch = !cached || isBalanceCacheStale(cached);

    if (shouldFetch) {
      void fetchBalance(liveWalletPubkey, { background: !!cached });
    }
  }, [applyCachedBalance, fetchBalance, isConnected, liveWalletPubkey, network]);

  useEffect(() => {
    if (!isConnected || !liveWalletPubkey) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void fetchBalance(liveWalletPubkey, { background: true });
    }, BALANCE_POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchBalance, isConnected, liveWalletPubkey]);

  useEffect(() => {
    if (!isConnected || !liveWalletPubkey) {
      return;
    }

    const handleFocus = () => {
      const elapsed = Date.now() - lastFetchAtRef.current;
      if (elapsed < BALANCE_FOCUS_MIN_MS) {
        return;
      }

      void fetchBalance(liveWalletPubkey, { background: true });
    };

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchBalance, isConnected, liveWalletPubkey]);

  const sol = lamports !== null ? lamports / LAMPORTS_PER_SOL : null;

  return {
    lamports,
    sol,
    formatted: sol !== null ? formatSolBalance(sol) : null,
    loading: isInitialLoading,
    error,
    refresh: () =>
      liveWalletPubkey
        ? fetchBalance(liveWalletPubkey, { background: false })
        : Promise.resolve(),
  };
}
