import {
  getTxlineNetworkFromEnv,
  resolveTxlineApiToken,
  resolveTxlineGuestJwt,
  type TxlineNetwork,
} from "@goalaxify/config";

export function getTxlineCredentials(network?: TxlineNetwork) {
  const resolvedNetwork = network ?? getTxlineNetworkFromEnv();
  const guestJwt = resolveTxlineGuestJwt(process.env, resolvedNetwork);
  const apiToken = resolveTxlineApiToken(process.env, resolvedNetwork);
  if (!guestJwt || !apiToken) return null;
  return { guestJwt, apiToken };
}

export function isTxlineConfigured(network?: TxlineNetwork): boolean {
  return getTxlineCredentials(network) !== null;
}
