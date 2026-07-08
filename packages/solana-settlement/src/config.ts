import {
  getTxlineNetworkConfig,
  getTxlineNetworkFromEnv,
  resolvePoolAuthorityPubkey,
  type TxlineNetwork,
  type TxlineNetworkConfig,
} from "@goalaxify/config";
import type { StakeToken } from "@goalaxify/domain";
import { PublicKey } from "@solana/web3.js";

export interface SettlementConfig extends TxlineNetworkConfig {
  poolAuthority: PublicKey | null;
  defaultClaimPeriodDays: number;
  usdcDecimals: number;
}

export function resolveSettlementNetwork(
  network?: TxlineNetwork,
): TxlineNetwork {
  if (network) return network;
  return getTxlineNetworkFromEnv();
}

export function getSettlementConfig(
  network?: TxlineNetwork,
): SettlementConfig {
  const resolved = resolveSettlementNetwork(network);
  const base = getTxlineNetworkConfig(resolved);
  const poolAuthorityRaw = resolvePoolAuthorityPubkey(process.env, resolved);

  return {
    ...base,
    poolAuthority: poolAuthorityRaw
      ? new PublicKey(poolAuthorityRaw)
      : null,
    defaultClaimPeriodDays: 7,
    usdcDecimals: 6,
  };
}

export function getStakeMint(
  config: SettlementConfig,
  token: StakeToken,
): PublicKey {
  if (token === "USDC") {
    return new PublicKey(config.usdtMint);
  }

  // Wrapped SOL mint for token-program flows when needed.
  return new PublicKey("So11111111111111111111111111111111111111112");
}
