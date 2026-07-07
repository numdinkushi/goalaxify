"use client";

import { WalletReadyState } from "@solana/wallet-adapter-base";
import type { WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import {
  DEFAULT_WALLET_NAME,
  isSupportedWalletName,
} from "@/lib/wallet/supported-wallets";
import {
  readWalletSession,
  WALLET_ADAPTER_STORAGE_KEY,
} from "@/lib/wallet/session-storage";

type WalletConnectContextValue = {
  connectWallet: (walletName?: WalletName) => Promise<void>;
};

const WalletConnectContext = createContext<WalletConnectContextValue | null>(
  null,
);

function isWalletConnectable(readyState: WalletReadyState) {
  return (
    readyState === WalletReadyState.Installed ||
    readyState === WalletReadyState.Loadable
  );
}

export function WalletConnectProvider({ children }: { children: ReactNode }) {
  const { select, wallet, wallets } = useWallet();
  const pendingWalletRef = useRef<WalletName | null>(null);
  const connectInFlightRef = useRef(false);
  const sessionRestoreAttemptedRef = useRef(false);

  const connectSelectedAdapter = useCallback(
    async (walletName: WalletName) => {
      const target = wallets.find((entry) => entry.adapter.name === walletName);
      if (!target || !isWalletConnectable(target.readyState)) {
        return;
      }

      if (target.adapter.connected) {
        return;
      }

      if (connectInFlightRef.current) {
        return;
      }

      connectInFlightRef.current = true;

      try {
        await target.adapter.connect();
      } catch {
        // Wallet provider onError handles user-facing failures.
      } finally {
        connectInFlightRef.current = false;
      }
    },
    [wallets],
  );

  const connectWallet = useCallback(
    async (walletName: WalletName = DEFAULT_WALLET_NAME) => {
      const target = wallets.find((entry) => entry.adapter.name === walletName);
      if (!target || !isWalletConnectable(target.readyState)) {
        return;
      }

      pendingWalletRef.current = walletName;

      if (wallet?.adapter.name !== walletName) {
        select(walletName);
        return;
      }

      pendingWalletRef.current = null;
      await connectSelectedAdapter(walletName);
    },
    [connectSelectedAdapter, select, wallet?.adapter.name, wallets],
  );

  useEffect(() => {
    const pendingWallet = pendingWalletRef.current;
    if (!pendingWallet || wallet?.adapter.name !== pendingWallet) {
      return;
    }

    const target = wallets.find((entry) => entry.adapter.name === pendingWallet);
    if (!target || !isWalletConnectable(target.readyState)) {
      return;
    }

    pendingWalletRef.current = null;
    void connectSelectedAdapter(pendingWallet);
  }, [connectSelectedAdapter, wallet, wallets]);

  useEffect(() => {
    if (
      sessionRestoreAttemptedRef.current ||
      wallet?.adapter.connected ||
      connectInFlightRef.current
    ) {
      return;
    }

    const storedWalletName = localStorage.getItem(WALLET_ADAPTER_STORAGE_KEY);
    if (storedWalletName) {
      return;
    }

    const session = readWalletSession();
    if (!session || !isSupportedWalletName(session.walletName as WalletName)) {
      return;
    }

    const target = wallets.find(
      (entry) => entry.adapter.name === session.walletName,
    );
    if (!target || !isWalletConnectable(target.readyState)) {
      return;
    }

    sessionRestoreAttemptedRef.current = true;
    void connectWallet(session.walletName as WalletName);
  }, [connectWallet, wallet?.adapter.connected, wallets]);

  return (
    <WalletConnectContext.Provider value={{ connectWallet }}>
      {children}
    </WalletConnectContext.Provider>
  );
}

export function useWalletConnect() {
  const context = useContext(WalletConnectContext);
  if (!context) {
    throw new Error("useWalletConnect must be used within WalletConnectProvider");
  }
  return context;
}
