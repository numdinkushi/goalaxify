import { MatchStatus } from "@/lib/enums";
import { deriveMatchStatus } from "@/lib/utils/match";

type RawRecord = Record<string, unknown>;

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
