import type { FeaturedMatchView } from "@/lib/data/types";

export type ScheduleDayGroup = {
  dayKey: string;
  dayLabel: string;
  matches: FeaturedMatchView[];
};

function startOfLocalDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function formatScheduleDayLabel(
  isoDate: string,
  now = Date.now(),
): string {
  const kickoff = Date.parse(isoDate);
  if (!Number.isFinite(kickoff)) return "TBD";

  const todayStart = startOfLocalDay(now);
  const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
  const kickoffDay = startOfLocalDay(kickoff);

  if (kickoffDay === todayStart) return "Today";
  if (kickoffDay === tomorrowStart) return "Tomorrow";

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(kickoff));
}

export function groupMatchesByScheduleDay(
  matches: FeaturedMatchView[],
  now = Date.now(),
): ScheduleDayGroup[] {
  const groups = new Map<string, ScheduleDayGroup>();

  for (const match of matches) {
    const kickoff = Date.parse(match.kickoffAt);
    const dayKey = Number.isFinite(kickoff)
      ? String(startOfLocalDay(kickoff))
      : "unknown";
    const dayLabel = formatScheduleDayLabel(match.kickoffAt, now);

    const existing = groups.get(dayKey);
    if (existing) {
      existing.matches.push(match);
      continue;
    }

    groups.set(dayKey, {
      dayKey,
      dayLabel,
      matches: [match],
    });
  }

  return Array.from(groups.values());
}
