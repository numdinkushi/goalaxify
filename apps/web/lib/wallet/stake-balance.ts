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
      const stakeSol =
        options.intendedStakeSol ??
        lamportsToSol(parsed.transferLamports);
      const balance = lamportsToSol(parsed.balanceLamports);
      const maxStake = maxStakeSolFromBalance(parsed.balanceLamports);

      if (maxStake > 0) {
        return `Not enough SOL for a ${stakeSol.toFixed(3)} SOL stake. Balance is ${balance.toFixed(4)} SOL — try ${maxStake.toFixed(3)} SOL or less (network fees need a small buffer).`;
      }

      return `Not enough SOL. Balance is ${balance.toFixed(4)} SOL — add devnet SOL to cover stake and fees.`;
    }

    return "Not enough SOL in your wallet to cover this stake and network fees. Lower the stake or add SOL.";
  }

  if (/user rejected|user denied|user cancel/i.test(raw)) {
    return "Transaction cancelled in Phantom.";
  }

  if (/simulation failed|sendtransactionerror|custom program error/i.test(raw)) {
    return "Transaction failed. Check your SOL balance covers the stake plus network fees, then try again.";
  }

  if (raw.length > 280) {
    return "Transaction failed. Check your SOL balance covers the stake plus network fees, then try again.";
  }

  return raw;
}
