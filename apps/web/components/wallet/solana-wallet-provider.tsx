"use client";

import { useCallback, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import type { Adapter, WalletError } from "@solana/wallet-adapter-base";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import type { ReactNode } from "react";

import { GoalaxifyWalletModalProvider } from "@/components/wallet/goalaxify-wallet-modal-provider";
import { WalletConnectProvider } from "@/components/wallet/wallet-connect-provider";
import { getSolanaRpcEndpoint } from "@/lib/solana/config";
import { handleWalletError } from "@/lib/wallet/errors";
import { sanitizeNavigatorWallets } from "@/lib/wallet/navigator-wallets-guard";
import { isSupportedWalletName } from "@/lib/wallet/supported-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

sanitizeNavigatorWallets();

type SolanaWalletProviderProps = {
  children: ReactNode;
};

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const endpoint = useMemo(() => getSolanaRpcEndpoint(), []);
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

  const onWalletError = useCallback((error: WalletError, adapter?: Adapter) => {
    handleWalletError(error, adapter);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={async (adapter) => isSupportedWalletName(adapter.name)}
        onError={onWalletError}
      >
        <WalletConnectProvider>
          <GoalaxifyWalletModalProvider>{children}</GoalaxifyWalletModalProvider>
        </WalletConnectProvider>
      </WalletProvider>
    </ConnectionProvider> 
  );
}
