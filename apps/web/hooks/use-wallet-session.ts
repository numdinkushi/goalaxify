"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { useHydrated } from "@/hooks/use-hydrated";
import { isConvexConfigured } from "@/lib/env/runtime";
import {
  clearWalletSession,
  hasStoredWalletSelection,
  readWalletSession,
  saveWalletSession,
  type WalletSessionSnapshot,
} from "@/lib/wallet/session-storage";
import { api } from "@goalaxify/convex/_generated/api";
import { useMutation } from "convex/react";

const RESTORE_GRACE_MS = 6000;

export function useWalletSession() {
  const hydrated = useHydrated();
  const {
    publicKey,
    connected,
    connecting,
    disconnect,
    wallet,
    select,
    wallets,
  } = useWallet();

  const [persistedSession, setPersistedSession] =
    useState<WalletSessionSnapshot | null>(null);
  const [restoreGraceActive, setRestoreGraceActive] = useState(false);

  const walletPubkey = useMemo(
    () => publicKey?.toBase58() ?? null,
    [publicKey],
  );

  const isConnected = connected && !!walletPubkey;

  const isRestoring =
    hydrated &&
    !isConnected &&
    hasStoredWalletSelection() &&
    (connecting || restoreGraceActive);

  const isSessionActive = isConnected || isRestoring;

  const sessionPubkey =
    hydrated && isSessionActive
      ? (walletPubkey ?? persistedSession?.walletPubkey ?? null)
      : null;

  const touchConnection = useMutation(api.profiles.touchConnection);
  const syncedWalletRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setPersistedSession(readWalletSession());
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (isConnected) {
      setRestoreGraceActive(false);
      return;
    }

    if (!hasStoredWalletSelection()) {
      setRestoreGraceActive(false);
      return;
    }

    setRestoreGraceActive(true);
    const timer = window.setTimeout(() => {
      setRestoreGraceActive(false);
    }, RESTORE_GRACE_MS);

    return () => window.clearTimeout(timer);
  }, [hydrated, isConnected]);

  useEffect(() => {
    if (!isConnected || !walletPubkey || !wallet?.adapter.name) {
      if (!connecting && !hasStoredWalletSelection()) {
        clearWalletSession();
        setPersistedSession(null);
      }
      return;
    }

    const snapshot = {
      walletPubkey,
      walletName: wallet.adapter.name,
    };

    saveWalletSession(snapshot);
    setPersistedSession({
      ...snapshot,
      updatedAt: Date.now(),
    });
  }, [connecting, isConnected, wallet?.adapter.name, walletPubkey]);

  const syncWalletProfile = useCallback(async () => {
    if (!isConnected || !walletPubkey || !isConvexConfigured()) return;
    if (syncedWalletRef.current === walletPubkey) return;

    await touchConnection({
      walletPubkey,
      walletName: wallet?.adapter.name,
    });
    syncedWalletRef.current = walletPubkey;
  }, [isConnected, touchConnection, wallet?.adapter.name, walletPubkey]);

  useEffect(() => {
    if (!isConnected) {
      syncedWalletRef.current = null;
      return;
    }
    void syncWalletProfile();
  }, [isConnected, syncWalletProfile]);

  const disconnectWallet = useCallback(async () => {
    clearWalletSession();
    setPersistedSession(null);
    setRestoreGraceActive(false);
    await disconnect();
  }, [disconnect]);

  return {
    walletPubkey: sessionPubkey,
    liveWalletPubkey: walletPubkey,
    connected,
    connecting,
    disconnect: disconnectWallet,
    wallet,
    select,
    wallets,
    isConnected,
    isRestoring,
    isSessionActive: hydrated && isSessionActive,
    persistedSession,
    syncWalletProfile,
  };
}
