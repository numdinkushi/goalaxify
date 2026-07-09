import { isSolanaNetwork, SolanaNetwork } from "@goalaxify/config";

/**
 * Next.js only inlines NEXT_PUBLIC_* vars when they are referenced statically.
 * Dynamic lookups (e.g. env[ACTIVE_SOLANA_NETWORK_ENV_KEY]) are undefined in client bundles.
 */
const DEPLOYMENT_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK;

export function getClientDeploymentSolanaNetwork(): SolanaNetwork {
  if (isSolanaNetwork(DEPLOYMENT_NETWORK)) {
    return DEPLOYMENT_NETWORK;
  }

  return SolanaNetwork.MainnetBeta;
}
