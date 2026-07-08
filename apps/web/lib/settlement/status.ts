import { isConvexConfigured } from "@/lib/env/runtime";
import { getSettlementNetworkFromEnv } from "@/lib/settlement/config";
import {
  getAppSettlementConfig,
  isOnChainStakingConfigured,
  isPoolAuthorityConfigured,
} from "@/lib/settlement/config";
import { isVapiCallsEnabled } from "@/lib/vapi/feature-flags";
import { isTxlineConfigured } from "@/lib/data/txline/enrich";

export type PipelineCheck = {
  id: string;
  label: string;
  ready: boolean;
  detail: string;
};

export function getPredictionPipelineChecks(): PipelineCheck[] {
  const settlement = getAppSettlementConfig();
  const network = getSettlementNetworkFromEnv();

  return [
    {
      id: "odds",
      label: "Pick a match + see TxLINE odds",
      ready: isTxlineConfigured(),
      detail: isTxlineConfigured() ? "Live" : "Configure TxLINE credentials",
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
      ready: isOnChainStakingConfigured() && isPoolAuthorityConfigured(),
      detail:
        isPoolAuthorityConfigured()
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
      ready: isPoolAuthorityConfigured(),
      detail: isPoolAuthorityConfigured()
        ? "Claim API + parimutuel resolve route"
        : "Configure pool authority for winner payouts",
    },
  ];
}
