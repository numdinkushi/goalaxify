import "server-only";

import { cookies } from "next/headers";
import {
  getSolanaNetworkFromEnv,
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

/** Deployment network from env — used for TxLINE fixture/odds data. */
export function getDeploymentSolanaNetwork(): SolanaNetwork {
  return getSolanaNetworkFromEnv();
}

export function getDeploymentSettlementNetwork(): TxlineNetwork {
  return toTxlineNetwork(getDeploymentSolanaNetwork());
}
