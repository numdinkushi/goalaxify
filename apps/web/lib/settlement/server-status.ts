import "server-only";

import { isConvexConfigured } from "@/lib/env/runtime";
import { isTxlineConfigured } from "@/lib/data/txline/enrich";
import {
  getAppSettlementConfig,
  isOnChainStakingConfigured,
  isPoolAuthorityConfigured,
} from "@/lib/settlement/config";
import { isVapiCallsEnabled } from "@/lib/vapi/feature-flags";

import type { PipelineCheck } from "./status";

export function getServerPredictionPipelineChecks(): PipelineCheck[] {
  const settlement = getAppSettlementConfig();
  const txlineReady = isTxlineConfigured();
  const poolPubkeyReady = isPoolAuthorityConfigured();
  const payoutSecretReady = !!process.env.POOL_AUTHORITY_SECRET;

  return [
    {
      id: "odds",
      label: "Pick a match + see TxLINE odds",
      ready: txlineReady,
      detail: txlineReady ? "Live" : "Set TXLINE_GUEST_JWT + TXLINE_API_TOKEN in .env.local",
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
        : "Set NEXT_PUBLIC_POOL_AUTHORITY_PUBKEY for SOL pool escrow",
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
            ? "Set POOL_AUTHORITY_SECRET (server) for claim payouts"
            : "Set NEXT_PUBLIC_POOL_AUTHORITY_PUBKEY + POOL_AUTHORITY_SECRET",
    },
  ];
}
