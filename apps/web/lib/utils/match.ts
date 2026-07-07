import { MatchStatus } from "@/lib/enums";

const STATUS_LABELS: Record<MatchStatus, string> = {
  [MatchStatus.Scheduled]: "Upcoming",
  [MatchStatus.Live]: "Live tonight",
  [MatchStatus.Halftime]: "Halftime",
  [MatchStatus.Finished]: "Full time",
};

export function getMatchStatusLabel(status: MatchStatus): string {
  return STATUS_LABELS[status];
}

export function isMatchLive(status: MatchStatus): boolean {
  return status === MatchStatus.Live || status === MatchStatus.Halftime;
}

export function isMarketMoving(delta: number): boolean {
  return Math.abs(delta) >= 0.5;
}
