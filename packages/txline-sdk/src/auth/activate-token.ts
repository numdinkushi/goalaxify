import { getTxlineNetworkConfig, type TxlineNetwork } from "@goalaxify/config";

export interface ActivateTokenInput {
  network?: TxlineNetwork;
  guestJwt: string;
  txSig: string;
  walletSignature: string;
  leagues?: number[];
}

export async function activateApiToken(input: ActivateTokenInput) {
  const network = input.network ?? "devnet";
  const config = getTxlineNetworkConfig(network);
  const leagues = input.leagues ?? [];

  const response = await fetch(`${config.apiBaseUrl}/token/activate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.guestJwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txSig: input.txSig,
      walletSignature: input.walletSignature,
      leagues,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Token activation failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { token?: string } | string;
  return typeof data === "string" ? data : (data.token ?? "");
}

export function buildActivationMessage(
  txSig: string,
  guestJwt: string,
  leagues: number[] = [],
) {
  return `${txSig}:${leagues.join(",")}:${guestJwt}`;
}
