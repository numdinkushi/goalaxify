import "server-only";

import { cookies } from "next/headers";
import {
  getSolanaNetworkFromEnv,
  isSolanaNetwork,
  SOLANA_NETWORK_COOKIE,
  SOLANA_NETWORK_EXPLICIT_COOKIE,
  SolanaNetwork,
  toTxlineNetwork,
  type TxlineNetwork,
} from "@goalaxify/config";

export async function getRequestSolanaNetwork(): Promise<SolanaNetwork> {
  const cookieStore = await cookies();
  const isExplicit =
    cookieStore.get(SOLANA_NETWORK_EXPLICIT_COOKIE)?.value === "1";

  if (isExplicit) {
    const preference = cookieStore.get(SOLANA_NETWORK_COOKIE)?.value;
    if (isSolanaNetwork(preference)) {
      return preference;
    }
  }

  return getSolanaNetworkFromEnv();
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
