import "server-only";

import { getSettlementConfig } from "@goalaxify/solana-settlement";

import {
  getRequestSettlementNetwork,
  getRequestSolanaNetwork,
} from "@/lib/solana/network-server";
import { getSolanaRpcEndpointForNetwork } from "@/lib/solana/network-utils";

export async function getRequestSettlementConfig() {
  const network = await getRequestSettlementNetwork();
  return getSettlementConfig(network);
}

export async function getRequestSolanaRpcEndpoint() {
  const network = await getRequestSolanaNetwork();
  return getSolanaRpcEndpointForNetwork(network);
}

export { getRequestSettlementNetwork, getRequestSolanaNetwork };
