import "server-only";

import { isTxlineConfigured } from "@/lib/data/txline/credentials";
import { getRequestSettlementNetwork } from "@/lib/solana/network-server";

export async function isTxlineConfiguredForRequest(): Promise<boolean> {
  const network = await getRequestSettlementNetwork();
  return isTxlineConfigured(network);
}
