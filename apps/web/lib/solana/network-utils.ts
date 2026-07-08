import { clusterApiUrl } from "@solana/web3.js";
import {
  getSolanaBalanceLabel,
  getSolanaNetworkFromEnv,
  getSolanaNetworkLabel,
  getTxlineNetworkConfig,
  isSolanaNetwork,
  resolveSolanaNetwork,
  resolveSolanaProgramId,
  resolveSolanaRpcUrl,
  SOLANA_NETWORK_COOKIE,
  SolanaNetwork,
  toTxlineNetwork,
  type TxlineNetwork,
} from "@goalaxify/config";

import { SOLANA_NETWORK_STORAGE_KEY } from "@/lib/solana/network-constants";

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
  return resolveSolanaNetwork({
    preference: getStoredSolanaNetwork(),
  });
}

export function saveSolanaNetworkPreference(network: SolanaNetwork) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(SOLANA_NETWORK_STORAGE_KEY, network);
  document.cookie = `${SOLANA_NETWORK_COOKIE}=${network}; path=/; max-age=31536000; SameSite=Lax`;
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
  return getSolanaNetworkFromEnv();
}
