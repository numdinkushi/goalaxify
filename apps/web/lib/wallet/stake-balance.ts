import { LAMPORTS_PER_SOL } from "@solana/web3.js";

/** Reserve lamports for the stake transfer tx fee (fee payer = user wallet). */
export const STAKE_TX_FEE_BUFFER_LAMPORTS = 10_000;

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

export function maxStakeSolFromBalance(balanceLamports: number): number {
  const maxLamports = Math.max(
    0,
    balanceLamports - STAKE_TX_FEE_BUFFER_LAMPORTS,
  );
  return lamportsToSol(maxLamports);
}

/** Fit stake to wallet balance, reserving lamports for the transfer tx fee. */
export function resolveAffordableStakeSol(
  requestedStakeSol: number,
  balanceLamports: number,
): { stakeSol: number; wasAdjusted: boolean } {
  if (requestedStakeSol <= 0) {
    throw new Error("Stake amount must be greater than zero.");
  }

  const maxStake = maxStakeSolFromBalance(balanceLamports);
  if (maxStake <= 0) {
    throw new Error(
      getInsufficientStakeMessage(requestedStakeSol, balanceLamports) ??
        "Not enough SOL to cover stake and network fees.",
    );
  }

  if (requestedStakeSol <= maxStake) {
    return { stakeSol: requestedStakeSol, wasAdjusted: false };
  }

  const shortfallLamports =
    solToLamports(requestedStakeSol) + STAKE_TX_FEE_BUFFER_LAMPORTS - balanceLamports;

  // Only short by fee dust — stake the max affordable amount instead of failing.
  if (shortfallLamports <= STAKE_TX_FEE_BUFFER_LAMPORTS * 2) {
    return { stakeSol: maxStake, wasAdjusted: true };
  }

  throw new Error(
    getInsufficientStakeMessage(requestedStakeSol, balanceLamports) ??
      "Not enough SOL to cover stake and network fees.",
  );
}

export function getInsufficientStakeMessage(
  stakeSol: number,
  balanceLamports: number,
): string | null {
  const stakeLamports = solToLamports(stakeSol);
  const requiredLamports = stakeLamports + STAKE_TX_FEE_BUFFER_LAMPORTS;

  if (balanceLamports >= requiredLamports) {
    return null;
  }

  const balanceSol = lamportsToSol(balanceLamports);
  const maxStake = maxStakeSolFromBalance(balanceLamports);

  if (maxStake <= 0) {
    return `Not enough SOL. You have ${balanceSol.toFixed(4)} SOL — add devnet SOL to cover stake and network fees.`;
  }

  return `Not enough SOL for a ${stakeSol.toFixed(3)} SOL stake. You have ${balanceSol.toFixed(4)} SOL — try ${maxStake.toFixed(3)} SOL or less (fees need ~0.00001 SOL extra).`;
}

type ParseStakeErrorOptions = {
  /** Stake the user confirmed in the UI — preferred over parsing chain logs. */
  intendedStakeSol?: number;
};

function collectErrorText(error: unknown): string {
  if (error instanceof Error) {
    const parts = [error.message];

    const maybeLogs = (error as { logs?: string[] }).logs;
    if (Array.isArray(maybeLogs) && maybeLogs.length > 0) {
      parts.push(maybeLogs.join("\n"));
    }

    return parts.join("\n");
  }

  if (typeof error === "string") {
    return error;
  }

  return "Failed to stake prediction";
}

function parseInsufficientLamports(raw: string): {
  balanceLamports: number;
  transferLamports: number;
} | null {
  const haveMatch = raw.match(/insufficient lamports (\d+)/i);
  const needMatch = raw.match(/need (\d+)/i);

  if (!haveMatch || !needMatch) {
    return null;
  }

  return {
    balanceLamports: Number(haveMatch[1]),
    transferLamports: Number(needMatch[1]),
  };
}

export function parseStakeTransactionError(
  error: unknown,
  options: ParseStakeErrorOptions = {},
): string {
  const raw = collectErrorText(error);

  if (/insufficient lamports/i.test(raw)) {
    const parsed = parseInsufficientLamports(raw);

    if (parsed) {
      const chainStakeSol = lamportsToSol(parsed.transferLamports);
      const stakeSol = chainStakeSol;
      const balance = lamportsToSol(parsed.balanceLamports);
      const maxStake = maxStakeSolFromBalance(parsed.balanceLamports);

      if (maxStake > 0) {
        const contextHint =
          options.intendedStakeSol !== undefined &&
          Math.abs(options.intendedStakeSol - chainStakeSol) > 0.001
            ? ` (transaction tried ${chainStakeSol.toFixed(3)} SOL)`
            : "";

        return `Not enough SOL for a ${stakeSol.toFixed(3)} SOL stake${contextHint}. Balance is ${balance.toFixed(4)} SOL — try ${maxStake.toFixed(3)} SOL or less (network fees need a small buffer).`;
      }

      return `Not enough SOL. Balance is ${balance.toFixed(4)} SOL — add devnet SOL to cover stake and fees.`;
    }

    return "Not enough SOL in your wallet to cover this stake and network fees. Lower the stake or add SOL.";
  }

  if (/user rejected|user denied|user cancel/i.test(raw)) {
    return "Transaction cancelled in Phantom.";
  }

  if (/simulation failed|sendtransactionerror|custom program error/i.test(raw)) {
    return parseSettlementError(raw);
  }

  if (raw.length > 280) {
    return parseSettlementError(raw);
  }

  return raw;
}

/** Friendly messages for server-side pool refunds / payouts. */
export function parseSettlementError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("settlement pool cannot cover") ||
    (lower.includes("insufficient lamports") &&
      lower.includes("pool authority"))
  ) {
    return "Refund from the pot failed — the settlement pool needs a tiny SOL reserve for network fees. Your stake is still safe. Try again in a moment.";
  }

  if (lower.includes("insufficient lamports")) {
    return "Settlement transaction failed — not enough SOL in the pool or wallet to cover the transfer and network fees. Try again shortly.";
  }

  if (lower.includes("simulation failed")) {
    return "On-chain transaction failed during simulation. Try again in a moment.";
  }

  if (message.length > 200) {
    return "Settlement transaction failed. Try again in a moment.";
  }

  return message;
}
