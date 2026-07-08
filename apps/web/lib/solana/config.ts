import { clusterApiUrl } from "@solana/web3.js";
import {
  getSolanaBalanceLabel,
  getSolanaNetworkFromEnv,
  resolveSolanaProgramId,
  resolveSolanaRpcUrl,
  type SolanaNetwork,
} from "@goalaxify/config";

import { getSettlementProgramId } from "@/lib/settlement/config";

export function getSolanaNetwork(): SolanaNetwork {
  return getSolanaNetworkFromEnv();
}

export function getSolanaRpcEndpoint(): string {
  return resolveSolanaRpcUrl() ?? clusterApiUrl(getSolanaNetwork());
}

export function getSolanaProgramId(): string | undefined {
  return resolveSolanaProgramId() ?? getSettlementProgramId();
}

export function getSolanaBalanceCardLabel(): string {
  return getSolanaBalanceLabel(getSolanaNetwork());
}
