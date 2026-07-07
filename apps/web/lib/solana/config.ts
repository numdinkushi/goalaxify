import { clusterApiUrl } from "@solana/web3.js";

import { getSettlementProgramId } from "@/lib/settlement/config";

export type SolanaNetwork = "devnet" | "mainnet-beta";

export function getSolanaNetwork(): SolanaNetwork {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
  return network === "mainnet-beta" ? "mainnet-beta" : "devnet";
}

export function getSolanaRpcEndpoint(): string {
  return (
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    clusterApiUrl(getSolanaNetwork())
  );
}

export function getSolanaProgramId(): string | undefined {
  return process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID ?? getSettlementProgramId();
}
