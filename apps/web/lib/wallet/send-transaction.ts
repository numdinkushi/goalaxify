import type { BlockhashWithExpiryBlockHeight } from "@solana/web3.js";

const WALLET_PROMPT_TIMEOUT_MS = 60_000;

export type PreparedBlockhash = {
  latest: BlockhashWithExpiryBlockHeight;
  fetchedAt: number;
};

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

export function isBlockhashFresh(
  latest: PreparedBlockhash | null,
  maxAgeMs = 45_000,
): latest is PreparedBlockhash {
  if (!latest) return false;
  return Date.now() - latest.fetchedAt <= maxAgeMs;
}

export async function promptWalletTransaction(
  sendTransaction: (transaction: import("@solana/web3.js").Transaction) => Promise<string>,
  transaction: import("@solana/web3.js").Transaction,
): Promise<string> {
  return withTimeout(
    sendTransaction(transaction),
    WALLET_PROMPT_TIMEOUT_MS,
    "Wallet did not respond. Close the Phantom sidebar, click Confirm again, and approve the transaction popup.",
  );
}
