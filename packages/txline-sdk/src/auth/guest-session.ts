import { getTxlineNetworkConfig, type TxlineNetwork } from "@goalaxify/config";

export async function startGuestSession(network: TxlineNetwork = "devnet") {
  const config = getTxlineNetworkConfig(network);
  const response = await fetch(`${config.apiOrigin}/auth/guest/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Guest auth failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}
