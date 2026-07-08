import type { SolanaNetwork } from "@goalaxify/config";

type BalanceResponse =
  | { ok: true; lamports: number }
  | { ok: false; error: string };

export async function fetchWalletBalanceLamports(
  pubkey: string,
  network: SolanaNetwork,
): Promise<number> {
  const params = new URLSearchParams({
    pubkey,
    network,
  });

  const response = await fetch(`/api/solana/balance?${params.toString()}`);
  const body = (await response.json()) as BalanceResponse;

  if (!response.ok || !body.ok) {
    throw new Error(
      body.ok === false ? body.error : "Unable to load balance",
    );
  }

  return body.lamports;
}
