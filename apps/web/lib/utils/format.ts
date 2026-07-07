export function formatKickoffTime(isoDate?: string): string {
  if (!isoDate) return "TBD";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoDate));
}

export function formatPercentage(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatReturnMultiplier(value?: number): string {
  if (!value || value <= 0) return "—";
  return `${value.toFixed(2)}×`;
}

export function formatChanceLabel(value: number): string {
  return `${Math.round(value)}% chance`;
}

export function formatMarketDelta(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatMatchTitle(homeTeam: string, awayTeam: string): string {
  return `${homeTeam} vs ${awayTeam}`;
}

export function formatScoreline(homeScore: number, awayScore: number): string {
  return `${homeScore} – ${awayScore}`;
}

export function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return "Just now";

  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function countdown(toMs: number, nowMs: number): string {
  const diff = Math.max(0, toMs - nowMs);
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

