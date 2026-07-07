import { MatchStatus } from "@/lib/enums";

const STATUS_LABELS: Record<MatchStatus, string> = {
  [MatchStatus.Scheduled]: "Upcoming",
  [MatchStatus.Live]: "Live",
  [MatchStatus.Halftime]: "Halftime",
  [MatchStatus.Finished]: "Full time",
};

const MATCH_DURATION_MS = 105 * 60 * 1000;

export function getMatchStatusLabel(status: MatchStatus): string {
  return STATUS_LABELS[status];
}

export function deriveMatchStatus(
  kickoffAt: string,
  reportedStatus: MatchStatus = MatchStatus.Scheduled,
  now = Date.now(),
): MatchStatus {
  const kickoffMs = Date.parse(kickoffAt);
  if (!Number.isFinite(kickoffMs)) {
    return reportedStatus;
  }

  if (now < kickoffMs) {
    return MatchStatus.Scheduled;
  }

  if (reportedStatus === MatchStatus.Finished) {
    return MatchStatus.Finished;
  }

  if (reportedStatus === MatchStatus.Halftime) {
    return MatchStatus.Halftime;
  }

  if (now >= kickoffMs + MATCH_DURATION_MS) {
    return MatchStatus.Finished;
  }

  if (reportedStatus === MatchStatus.Live) {
    return MatchStatus.Live;
  }

  return MatchStatus.Live;
}

export function isMatchLive(status: MatchStatus): boolean {
  return status === MatchStatus.Live || status === MatchStatus.Halftime;
}

export function hasMatchKickedOff(
  kickoffAt: string,
  now = Date.now(),
): boolean {
  const kickoffMs = Date.parse(kickoffAt);
  return Number.isFinite(kickoffMs) && now >= kickoffMs;
}

export function isMatchBettingClosed(
  kickoffAt: string,
  status: MatchStatus,
  now = Date.now(),
): boolean {
  if (status === MatchStatus.Finished) return true;
  if (isMatchLive(status)) return true;
  return hasMatchKickedOff(kickoffAt, now);
}

export function isBoothOpenForMatch(
  kickoffAt: string,
  status: MatchStatus,
  now = Date.now(),
): boolean {
  return !isMatchBettingClosed(kickoffAt, status, now);
}

export function isMarketMoving(delta: number): boolean {
  return Math.abs(delta) >= 0.5;
}

export function findLiveMatch<T extends { status: MatchStatus }>(
  matches: T[],
): T | null {
  return matches.find((match) => isMatchLive(match.status)) ?? null;
}
