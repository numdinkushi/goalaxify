import { MatchStatus } from "@/lib/enums";
import { deriveMatchStatus } from "@/lib/utils/match";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord | null {
  return value && typeof value === "object" ? (value as RawRecord) : null;
}

function normalizeScoresEntries(raw: unknown): RawRecord[] {
  if (!raw) return [];

  const entries = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? ((raw as RawRecord).scores ??
        (raw as RawRecord).events ??
        (raw as RawRecord).data ??
        (raw as RawRecord).snapshot)
      : null;

  return Array.isArray(entries) ? entries.map(asRecord).filter(Boolean) as RawRecord[] : [];
}

function readScore(stats: RawRecord | undefined, key: string): number | null {
  if (!stats) return null;
  const value = stats[key];
  return typeof value === "number" ? value : null;
}

function isFulltimeEntry(entry: RawRecord): boolean {
  if (entry.Action !== "status") return false;
  const clock = asRecord(entry.Clock);
  const seconds = typeof clock?.Seconds === "number" ? clock.Seconds : 0;
  const gameState = String(entry.GameState ?? "").toLowerCase();
  return (
    seconds >= 5400 ||
    gameState.includes("finish") ||
    gameState.includes("ended") ||
    gameState.includes("complete")
  );
}

export type TxlineScoreSnapshot = {
  homeScore: number;
  awayScore: number;
  isFinished: boolean;
};

export function extractScoresFromSnapshot(raw: unknown): TxlineScoreSnapshot {
  const entries = normalizeScoresEntries(raw);
  if (entries.length === 0) {
    return { homeScore: 0, awayScore: 0, isFinished: false };
  }

  const sorted = [...entries].sort((a, b) => Number(a.Ts ?? 0) - Number(b.Ts ?? 0));

  let homeScore = 0;
  let awayScore = 0;
  let isFinished = false;

  for (const entry of sorted) {
    const stats = asRecord(entry.Stats) ?? undefined;
    const nextHome = readScore(stats, "1");
    const nextAway = readScore(stats, "2");

    if (nextHome !== null && nextAway !== null) {
      homeScore = nextHome;
      awayScore = nextAway;
    }

    if (isFulltimeEntry(entry)) {
      isFinished = true;
    }
  }

  const latest = sorted[sorted.length - 1];
  const latestStatus = String(
    latest.Status ?? latest.status ?? latest.MatchStatus ?? latest.phase ?? "",
  ).toLowerCase();

  if (
    latestStatus.includes("finish") ||
    latestStatus.includes("full") ||
    latestStatus.includes("ended") ||
    latestStatus.includes("complete")
  ) {
    isFinished = true;
  }

  return { homeScore, awayScore, isFinished };
}

export function mapTxlineScoresStatus(
  raw: unknown,
  kickoffAt: string,
): MatchStatus | null {
  if (!raw) {
    return null;
  }

  const entries = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? ((raw as RawRecord).scores ??
        (raw as RawRecord).events ??
        (raw as RawRecord).data ??
        (raw as RawRecord).snapshot)
      : null;

  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  const latest = entries[entries.length - 1] as RawRecord;
  const status = String(
    latest.Status ?? latest.status ?? latest.MatchStatus ?? latest.phase ?? "",
  ).toLowerCase();

  if (status.includes("half")) {
    return MatchStatus.Halftime;
  }

  if (
    status.includes("finish") ||
    status.includes("full") ||
    status.includes("ended") ||
    status.includes("complete")
  ) {
    return MatchStatus.Finished;
  }

  if (status.includes("live") || status.includes("inplay") || status.includes("in_play")) {
    return MatchStatus.Live;
  }

  const kickoffMs = Date.parse(kickoffAt);
  if (Number.isFinite(kickoffMs) && Date.now() >= kickoffMs) {
    return MatchStatus.Live;
  }

  return deriveMatchStatus(kickoffAt, MatchStatus.Scheduled);
}
