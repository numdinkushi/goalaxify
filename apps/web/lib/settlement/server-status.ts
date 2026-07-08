import "server-only";

import {
  getTxlineNetworkFromEnv,
  resolvePoolAuthoritySecret,
} from "@goalaxify/config";
import { isConvexConfigured } from "@/lib/env/runtime";
import { isTxlineConfigured } from "@/lib/data/txline/enrich";
import {
  getAppSettlementConfig,
  getSettlementNetworkFromEnv,
  isOnChainStakingConfigured,
  isPoolAuthorityConfigured,
} from "@/lib/settlement/config";
import { isVapiCallsEnabled } from "@/lib/vapi/feature-flags";

import type { PipelineCheck } from "./status";

export function getServerPredictionPipelineChecks(): PipelineCheck[] {
  const settlement = getAppSettlementConfig();
  const network = getSettlementNetworkFromEnv();
  const txlineReady = isTxlineConfigured();
  const poolPubkeyReady = isPoolAuthorityConfigured();
  const payoutSecretReady = !!resolvePoolAuthoritySecret();
  const txlineNetwork = getTxlineNetworkFromEnv();

  return [
    {
      id: "odds",
      label: "Pick a match + see TxLINE odds",
      ready: txlineReady,
      detail: txlineReady
        ? "Live"
        : `Set TxLINE credentials for ${txlineNetwork} in your env file`,
    },
    {
      id: "wallet",
      label: "Connect Phantom wallet",
      ready: true,
      detail: "Wallet adapter enabled",
    },
    {
      id: "voice",
      label: "Voice booth",
      ready: isVapiCallsEnabled(),
      detail: isVapiCallsEnabled() ? "Voice sessions enabled" : "Add Vapi token",
    },
    {
      id: "stake",
      label: "Stake SOL / USDC",
      ready: isOnChainStakingConfigured() && poolPubkeyReady,
      detail: poolPubkeyReady
        ? `SOL pool + USDC intents on ${settlement.network}`
        : `Configure pool authority for ${network} SOL escrow`,
    },
    {
      id: "convex",
      label: "Store prediction in Convex",
      ready: isConvexConfigured(),
      detail: isConvexConfigured() ? "predictions table ready" : "Set NEXT_PUBLIC_CONVEX_URL",
    },
    {
      id: "settlement",
      label: "On-chain escrow / settlement",
      ready: isOnChainStakingConfigured(),
      detail: `@goalaxify/solana-settlement · ${settlement.programId.slice(0, 8)}…`,
    },
    {
      id: "payout",
      label: "Pay winners",
      ready: poolPubkeyReady && payoutSecretReady,
      detail:
        poolPubkeyReady && payoutSecretReady
          ? "Claim API + parimutuel resolve route"
          : poolPubkeyReady
            ? `Set the ${network} pool authority secret for claim payouts`
            : `Configure ${network} pool authority pubkey and secret`,
    },
  ];
}
