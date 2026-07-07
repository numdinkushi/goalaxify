export type TxlineNetwork = "devnet" | "mainnet";

export interface TxlineNetworkConfig {
  network: TxlineNetwork;
  rpcUrl: string;
  apiOrigin: string;
  apiBaseUrl: string;
  programId: string;
  txlTokenMint: string;
  usdtMint: string;
}

/** Official TxLINE network constants from txodds/tx-on-chain */
export const TXLINE_NETWORKS: Record<TxlineNetwork, TxlineNetworkConfig> = {
  devnet: {
    network: "devnet",
    rpcUrl: "https://api.devnet.solana.com",
    apiOrigin: "https://txline-dev.txodds.com",
    apiBaseUrl: "https://txline-dev.txodds.com/api",
    programId: "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J",
    txlTokenMint: "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG",
    usdtMint: "ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh",
  },
  mainnet: {
    network: "mainnet",
    rpcUrl: "https://api.mainnet-beta.solana.com",
    apiOrigin: "https://txline.txodds.com",
    apiBaseUrl: "https://txline.txodds.com/api",
    programId: "9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA",
    txlTokenMint: "Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL",
    usdtMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
};

export const WORLD_CUP_FREE_TIERS = {
  delayed: 1,
  realtime: 12,
} as const;

export function getTxlineNetworkConfig(network: TxlineNetwork = "devnet") {
  return TXLINE_NETWORKS[network];
}
