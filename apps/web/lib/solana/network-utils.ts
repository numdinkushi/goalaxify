import { clusterApiUrl } from "@solana/web3.js";
import {
  getSolanaBalanceLabel,
  getSolanaNetworkLabel,
  getTxlineNetworkConfig,
  isSolanaNetwork,
  resolveSolanaProgramId,
  resolveSolanaRpcUrl,
  SOLANA_NETWORK_COOKIE,
  SOLANA_NETWORK_EXPLICIT_COOKIE,
  SolanaNetwork,
  toTxlineNetwork,
  type TxlineNetwork,
} from "@goalaxify/config";

import { getClientDeploymentSolanaNetwork } from "@/lib/solana/network-env-client";
import {
  SOLANA_NETWORK_EXPLICIT_KEY,
  SOLANA_NETWORK_STORAGE_KEY,
} from "@/lib/solana/network-constants";

export function hasExplicitSolanaNetworkPreference(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(SOLANA_NETWORK_EXPLICIT_KEY) === "1";
}

export function getStoredSolanaNetwork(): SolanaNetwork | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(SOLANA_NETWORK_STORAGE_KEY);
  if (isSolanaNetwork(stored)) {
    return stored;
  }

  return null;
}

export function getInitialSolanaNetwork(): SolanaNetwork {
  if (hasExplicitSolanaNetworkPreference()) {
    const stored = getStoredSolanaNetwork();
    if (stored) {
      return stored;
    }
  }

  return getClientDeploymentSolanaNetwork();
}

export function saveSolanaNetworkPreference(network: SolanaNetwork) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(SOLANA_NETWORK_STORAGE_KEY, network);
  localStorage.setItem(SOLANA_NETWORK_EXPLICIT_KEY, "1");
  document.cookie = `${SOLANA_NETWORK_COOKIE}=${network}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = `${SOLANA_NETWORK_EXPLICIT_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax`;
}

export function getSolanaRpcEndpointForNetwork(network: SolanaNetwork): string {
  return resolveSolanaRpcUrl(process.env, network) ?? clusterApiUrl(network);
}

export function getSolanaProgramIdForNetwork(
  network: SolanaNetwork,
): string | undefined {
  return resolveSolanaProgramId(process.env, network);
}

export function getSettlementProgramIdForNetwork(
  network: SolanaNetwork,
): string {
  return getTxlineNetworkConfig(toTxlineNetwork(network)).programId;
}

export function getSolanaBalanceLabelForNetwork(network: SolanaNetwork): string {
  return getSolanaBalanceLabel(network);
}

export function getSolanaNetworkDisplayLabel(network: SolanaNetwork): string {
  return getSolanaNetworkLabel(network);
}

export function toSettlementNetwork(network: SolanaNetwork): TxlineNetwork {
  return toTxlineNetwork(network);
}

export function getDefaultSolanaNetworkFromEnv(): SolanaNetwork {
  return getClientDeploymentSolanaNetwork();
}
