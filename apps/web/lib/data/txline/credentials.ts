import {
  getTxlineNetworkFromEnv,
  resolveTxlineApiToken,
  resolveTxlineGuestJwt,
  type TxlineNetwork,
} from "@goalaxify/config";

export function hasTxlineApiToken(network?: TxlineNetwork): boolean {
  const resolvedNetwork = network ?? getTxlineNetworkFromEnv();
  return Boolean(resolveTxlineApiToken(process.env, resolvedNetwork));
}

export function getTxlineCredentials(network?: TxlineNetwork) {
  const resolvedNetwork = network ?? getTxlineNetworkFromEnv();
  const guestJwt = resolveTxlineGuestJwt(process.env, resolvedNetwork);
  const apiToken = resolveTxlineApiToken(process.env, resolvedNetwork);
  if (!guestJwt || !apiToken) return null;
  return { guestJwt, apiToken };
}

/** True when the API token is present. Guest JWT is minted server-side per request. */
export function isTxlineConfigured(network?: TxlineNetwork): boolean {
  return hasTxlineApiToken(network);
}
