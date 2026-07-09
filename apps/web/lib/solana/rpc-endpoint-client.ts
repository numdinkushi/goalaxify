import { SolanaNetwork } from "@goalaxify/config";
import { clusterApiUrl } from "@solana/web3.js";

/**
 * Next.js only inlines NEXT_PUBLIC_* vars when they are referenced statically.
 * Network-scoped resolution via dynamic keys does not work in client bundles.
 */
const DEVNET_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL_DEVNET ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

const MAINNET_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL_MAINNET ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

export function getSolanaRpcEndpointForClient(network: SolanaNetwork): string {
  if (network === SolanaNetwork.MainnetBeta) {
    return MAINNET_RPC ?? clusterApiUrl("mainnet-beta");
  }

  return DEVNET_RPC ?? clusterApiUrl("devnet");
}
