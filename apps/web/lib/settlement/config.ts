import { getTxlineNetworkFromEnv } from "@goalaxify/config";
import {
  getPoolAuthorityPubkey,
  getSettlementConfig,
} from "@goalaxify/solana-settlement";

export function getSettlementNetworkFromEnv() {
  return getTxlineNetworkFromEnv();
}

export function getAppSettlementConfig() {
  return getSettlementConfig(getSettlementNetworkFromEnv());
}

export function isPoolAuthorityConfigured(network = getSettlementNetworkFromEnv()) {
  return getPoolAuthorityPubkey(network) !== null;
}

export function isOnChainStakingConfigured(): boolean {
  const config = getAppSettlementConfig();
  return !!config.programId && !!config.rpcUrl;
}

export function getSettlementProgramId(): string {
  return getAppSettlementConfig().programId;
}

export { getTxlineNetworkFromEnv as resolveSettlementNetwork };
