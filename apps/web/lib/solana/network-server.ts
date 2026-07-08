import "server-only";

import { cookies } from "next/headers";
import {
  resolveSolanaNetwork,
  SOLANA_NETWORK_COOKIE,
  SolanaNetwork,
  toTxlineNetwork,
  type TxlineNetwork,
} from "@goalaxify/config";

export async function getRequestSolanaNetwork(): Promise<SolanaNetwork> {
  const cookieStore = await cookies();

  return resolveSolanaNetwork({
    preference: cookieStore.get(SOLANA_NETWORK_COOKIE)?.value,
  });
}

export async function getRequestSettlementNetwork(): Promise<TxlineNetwork> {
  return toTxlineNetwork(await getRequestSolanaNetwork());
}
