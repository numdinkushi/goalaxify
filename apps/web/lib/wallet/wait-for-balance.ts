import type { Connection, PublicKey } from "@solana/web3.js";

const POLL_MS = 400;
const DEFAULT_TIMEOUT_MS = 30_000;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Wait until the wallet holds at least `minLamports` (e.g. after a pot refund). */
export async function waitForSolBalanceAtLeast(
  connection: Connection,
  pubkey: PublicKey,
  minLamports: number,
  refundTxSig?: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<number> {
  if (refundTxSig) {
    try {
      const latest = await connection.getLatestBlockhash("confirmed");
      await connection.confirmTransaction(
        {
          signature: refundTxSig,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight,
        },
        "confirmed",
      );
    } catch {
      // Devnet can be flaky — fall back to balance polling below.
    }
  }

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const balance = await connection.getBalance(pubkey);
    if (balance >= minLamports) {
      return balance;
    }
    await sleep(POLL_MS);
  }

  const balance = await connection.getBalance(pubkey);
  if (balance >= minLamports) {
    return balance;
  }

  throw new Error(
    "Your refund is still settling. Wait a few seconds, then try again.",
  );
}
