export function formatSolAmount(sol: number): string {
  if (sol === 0) {
    return "0";
  }

  if (sol < 0.0001) {
    return "<0.0001";
  }

  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export function formatSolBalance(sol: number): string {
  return `${formatSolAmount(sol)} SOL`;
}
