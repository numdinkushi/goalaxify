import "server-only";

import {
  resolveTxlineApiToken,
  resolveTxlineGuestJwt,
  type TxlineNetwork,
} from "@goalaxify/config";
import { startGuestSession } from "@goalaxify/txline-sdk/auth/guest-session";

import { hasTxlineApiToken } from "@/lib/data/txline/credentials";
import {
  getDeploymentSettlementNetwork,
  getRequestSettlementNetwork,
} from "@/lib/solana/network-server";

export type TxlineServerCredentials = {
  guestJwt: string;
  apiToken: string;
  network: TxlineNetwork;
};

/**
 * TxLINE guest JWTs are IP-bound when minted locally. Production servers must
 * start a fresh guest session from their own IP while reusing the stored API
 * token from `npm run txline:setup`.
 */
export async function resolveTxlineCredentialsForServer(
  network?: TxlineNetwork,
): Promise<TxlineServerCredentials | null> {
  const resolvedNetwork = network ?? (await getRequestSettlementNetwork());
  const apiToken = resolveTxlineApiToken(process.env, resolvedNetwork);
  if (!apiToken) {
    return null;
  }

  try {
    const guestJwt = await startGuestSession(resolvedNetwork);
    return { guestJwt, apiToken, network: resolvedNetwork };
  } catch {
    const guestJwt = resolveTxlineGuestJwt(process.env, resolvedNetwork);
    if (!guestJwt) {
      return null;
    }

    return { guestJwt, apiToken, network: resolvedNetwork };
  }
}

export async function isTxlineConfiguredForRequest(): Promise<boolean> {
  if (await resolveTxlineCredentialsForServer()) {
    return true;
  }

  const requestNetwork = await getRequestSettlementNetwork();
  const deploymentNetwork = getDeploymentSettlementNetwork();
  if (requestNetwork === deploymentNetwork) {
    return false;
  }

  return (
    hasTxlineApiToken(deploymentNetwork) &&
    (await resolveTxlineCredentialsForServer(deploymentNetwork)) !== null
  );
}
