import { SolanaNetwork } from "@goalaxify/config";

export const SOLANA_NETWORK_STORAGE_KEY = "goalaxify-solana-network";
export const SOLANA_NETWORK_EXPLICIT_KEY = "goalaxify-solana-network-explicit";

export const SOLANA_NETWORK_OPTIONS = [
  SolanaNetwork.Devnet,
  SolanaNetwork.MainnetBeta,
] as const;
