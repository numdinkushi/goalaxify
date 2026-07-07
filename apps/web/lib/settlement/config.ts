import {
  getPoolAuthorityPubkey,
  getSettlementConfig,
  resolveSettlementNetwork,
} from "@goalaxify/solana-settlement";

import { getSolanaNetwork } from "@/lib/solana/config";

export function getSettlementNetworkFromEnv() {
  const solanaNetwork = getSolanaNetwork();
  return solanaNetwork === "mainnet-beta" ? "mainnet" : "devnet";
}

export function getAppSettlementConfig() {
  return getSettlementConfig(getSettlementNetworkFromEnv());
}

export function isPoolAuthorityConfigured(): boolean {
  return getPoolAuthorityPubkey(getSettlementNetworkFromEnv()) !== null;
}

export function isOnChainStakingConfigured(): boolean {
  const config = getAppSettlementConfig();
  return !!config.programId && !!config.rpcUrl;
}

export function getSettlementProgramId(): string {
  return getAppSettlementConfig().programId;
}

export { resolveSettlementNetwork };
