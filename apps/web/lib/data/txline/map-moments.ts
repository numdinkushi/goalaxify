import type { MomentView } from "@/lib/data/types";

type RawRecord = Record<string, unknown>;

const GOAL_ACTIONS = new Set([
  "goal",
  "score",
  "penalty_goal",
  "own_goal",
  "penalty_scored",
]);

const DEFAULT_CLIP_URL = "/assets/video/goals.mp4";

function asRecord(value: unknown): RawRecord | null {
  return value && typeof value === "object" ? (value as RawRecord) : null;
}

function readScore(stats: RawRecord | undefined, key: string): number | null {
  if (!stats) return null;
  const value = stats[key];
  return typeof value === "number" ? value : null;
}

function clockMinute(entry: RawRecord): number {
  const clock = asRecord(entry.Clock);
  const seconds =
    typeof clock?.Seconds === "number"
      ? clock.Seconds
      : typeof entry.Minute === "number"
        ? entry.Minute * 60
        : 0;
  return Math.max(0, Math.floor(seconds / 60));
}

function clipFromEntry(entry: RawRecord): string | undefined {
  const data = asRecord(entry.Data);
  const candidates = [
    data?.ClipUrl,
    data?.VideoUrl,
    data?.clipUrl,
    data?.videoUrl,
    entry.ClipUrl,
    entry.VideoUrl,
  ];
  const url = candidates.find((value) => typeof value === "string" && value.length > 0);
  return typeof url === "string" ? url : undefined;
}

function scorerFromEntry(entry: RawRecord): string | undefined {
  const data = asRecord(entry.Data);
  const candidates = [
    data?.PlayerName,
    data?.Scorer,
    data?.playerName,
    entry.PlayerName,
    entry.Scorer,
  ];
  const name = candidates.find((value) => typeof value === "string" && value.length > 0);
  return typeof name === "string" ? name : undefined;
}

function scoringTeamLabel(
  participant: unknown,
  homeTeam: string,
  awayTeam: string,
): string | undefined {
  if (participant === 1 || participant === "1" || participant === "home") {
    return homeTeam;
  }
  if (participant === 2 || participant === "2" || participant === "away") {
    return awayTeam;
  }
  return undefined;
}

function isHalftimeEntry(entry: RawRecord): boolean {
  if (entry.Action !== "status") return false;
  const clock = asRecord(entry.Clock);
  const seconds = typeof clock?.Seconds === "number" ? clock.Seconds : 0;
  const data = asRecord(entry.Data);
  const statusId = data?.StatusId ?? entry.StatusId;
  return seconds >= 2700 && seconds < 2760 && statusId === 4 && clock?.Running === false;
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

function momentId(
  fixtureId: number,
  eventType: MomentView["eventType"],
  minute: number,
  homeScore: number,
  awayScore: number,
): string {
  return `${fixtureId}-${eventType}-${minute}-${homeScore}-${awayScore}`;
}

export function mapTxlineScoresToMoments(
  raw: unknown,
  fixtureId: number,
  homeTeam: string,
  awayTeam: string,
): MomentView[] {
  const entries = Array.isArray(raw) ? raw : [];
  if (entries.length === 0) return [];

  const sorted = [...entries].sort((a, b) => {
    const left = asRecord(a);
    const right = asRecord(b);
    return Number(left?.Ts ?? 0) - Number(right?.Ts ?? 0);
  });

  const moments: MomentView[] = [];
  let homeScore = 0;
  let awayScore = 0;
  let sawHalftime = false;
  let sawFulltime = false;

  for (const item of sorted) {
    const entry = asRecord(item);
    if (!entry) continue;

    const stats = asRecord(entry.Stats) ?? undefined;
    const nextHome = readScore(stats, "1");
    const nextAway = readScore(stats, "2");
    const minute = clockMinute(entry);
    const createdAt = typeof entry.Ts === "number" ? entry.Ts : undefined;
    const action = String(entry.Action ?? "").toLowerCase();

    if (nextHome !== null && nextAway !== null) {
      const homeDelta = nextHome - homeScore;
      const awayDelta = nextAway - awayScore;

      if (homeDelta > 0 || awayDelta > 0) {
        const scoringSide =
          homeDelta > 0
            ? 1
            : awayDelta > 0
              ? 2
              : (entry.Participant ?? undefined);
        const team = scoringTeamLabel(scoringSide, homeTeam, awayTeam);
        const scorer = scorerFromEntry(entry);
        const clipUrl = clipFromEntry(entry) ?? DEFAULT_CLIP_URL;

        moments.push({
          id: momentId(fixtureId, "goal", minute, nextHome, nextAway),
          fixtureId,
          minute,
          homeScore: nextHome,
          awayScore: nextAway,
          eventType: "goal",
          scorer,
          clipUrl,
          summary: scorer
            ? `${scorer} scores for ${team ?? "the attack"}.`
            : team
              ? `${team} score! ${nextHome}-${nextAway}.`
              : `Goal! ${nextHome}-${nextAway}.`,
          createdAt,
        });
      }

      homeScore = nextHome;
      awayScore = nextAway;
    }

    if (GOAL_ACTIONS.has(action) && nextHome === null) {
      const team = scoringTeamLabel(entry.Participant, homeTeam, awayTeam);
      const scorer = scorerFromEntry(entry);
      const clipUrl = clipFromEntry(entry) ?? DEFAULT_CLIP_URL;
      moments.push({
        id: momentId(fixtureId, "goal", minute, homeScore, awayScore),
        fixtureId,
        minute,
        homeScore,
        awayScore,
        eventType: "goal",
        scorer,
        clipUrl,
        summary: scorer
          ? `${scorer} scores for ${team ?? "the attack"}.`
          : team
            ? `${team} find the net.`
            : "Goal!",
        createdAt,
      });
    }

    if (!sawHalftime && isHalftimeEntry(entry)) {
      sawHalftime = true;
      moments.push({
        id: momentId(fixtureId, "halftime", minute, homeScore, awayScore),
        fixtureId,
        minute: Math.max(minute, 45),
        homeScore,
        awayScore,
        eventType: "halftime",
        summary: `Half time — ${homeScore}-${awayScore}.`,
        createdAt,
      });
    }

    if (!sawFulltime && isFulltimeEntry(entry)) {
      sawFulltime = true;
      moments.push({
        id: momentId(fixtureId, "fulltime", minute, homeScore, awayScore),
        fixtureId,
        minute: Math.max(minute, 90),
        homeScore,
        awayScore,
        eventType: "fulltime",
        summary: `Full time — ${homeScore}-${awayScore}.`,
        createdAt,
      });
    }
  }

  return moments.sort((a, b) => {
    const timeA = a.createdAt ?? a.minute;
    const timeB = b.createdAt ?? b.minute;
    return timeB - timeA;
  });
}
