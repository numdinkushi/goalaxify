"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SolanaNetwork } from "@goalaxify/config";
import { useRouter } from "next/navigation";

import { getSolanaRpcEndpointForClient } from "@/lib/solana/rpc-endpoint-client";
import {
  getDefaultSolanaNetworkFromEnv,
  getInitialSolanaNetwork,
  getSolanaBalanceLabelForNetwork,
  getSolanaNetworkDisplayLabel,
  saveSolanaNetworkPreference,
  toSettlementNetwork,
} from "@/lib/solana/network-utils";
import { appToast } from "@/lib/toast";

type SolanaNetworkContextValue = {
  network: SolanaNetwork;
  settlementNetwork: ReturnType<typeof toSettlementNetwork>;
  networkLabel: string;
  balanceLabel: string;
  rpcEndpoint: string;
  isMainnet: boolean;
  setNetwork: (network: SolanaNetwork) => void;
  toggleNetwork: () => void;
};

const SolanaNetworkContext = createContext<SolanaNetworkContextValue | undefined>(
  undefined,
);

export function SolanaNetworkProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [network, setNetworkState] = useState<SolanaNetwork>(
    getDefaultSolanaNetworkFromEnv,
  );
  const shouldRefreshRef = useRef(false);

  useEffect(() => {
    const initialNetwork = getInitialSolanaNetwork();
    setNetworkState(initialNetwork);
    saveSolanaNetworkPreference(initialNetwork);
  }, []);

  useEffect(() => {
    if (!shouldRefreshRef.current) {
      return;
    }

    shouldRefreshRef.current = false;
    saveSolanaNetworkPreference(network);
    appToast.genericSuccess(
      `Switched to ${getSolanaNetworkDisplayLabel(network)}`,
    );
    router.refresh();
  }, [network, router]);

  const setNetwork = useCallback((nextNetwork: SolanaNetwork) => {
    setNetworkState((current) => {
      if (current === nextNetwork) {
        return current;
      }

      shouldRefreshRef.current = true;
      return nextNetwork;
    });
  }, []);

  const toggleNetwork = useCallback(() => {
    setNetwork(
      network === SolanaNetwork.MainnetBeta
        ? SolanaNetwork.Devnet
        : SolanaNetwork.MainnetBeta,
    );
  }, [network, setNetwork]);

  const value = useMemo<SolanaNetworkContextValue>(
    () => ({
      network,
      settlementNetwork: toSettlementNetwork(network),
      networkLabel: getSolanaNetworkDisplayLabel(network),
      balanceLabel: getSolanaBalanceLabelForNetwork(network),
      rpcEndpoint: getSolanaRpcEndpointForClient(network),
      isMainnet: network === SolanaNetwork.MainnetBeta,
      setNetwork,
      toggleNetwork,
    }),
    [network, setNetwork, toggleNetwork],
  );

  return (
    <SolanaNetworkContext.Provider value={value}>
      {children}
    </SolanaNetworkContext.Provider>
  );
}

export function useSolanaNetwork() {
  const context = useContext(SolanaNetworkContext);
  if (!context) {
    throw new Error("useSolanaNetwork must be used within SolanaNetworkProvider");
  }
  return context;
}
