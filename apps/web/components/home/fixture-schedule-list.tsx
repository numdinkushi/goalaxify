"use client";

import { FixtureScheduleRow } from "@/components/home/fixture-schedule-row";
import type { FeaturedMatchView } from "@/lib/data/types";
import { groupMatchesByScheduleDay } from "@/lib/utils/schedule";

type FixtureScheduleListProps = {
  matches: FeaturedMatchView[];
  selectedFixtureId: number;
  onSelect: (fixtureId: number) => void;
  disabled?: boolean;
};

export function FixtureScheduleList({
  matches,
  selectedFixtureId,
  onSelect,
  disabled = false,
}: FixtureScheduleListProps) {
  const groups = groupMatchesByScheduleDay(matches);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.dayKey} className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {group.dayLabel}
          </p>
          <div className="space-y-2">
            {group.matches.map((match) => (
              <FixtureScheduleRow
                key={match.fixtureId}
                match={match}
                selected={match.fixtureId === selectedFixtureId}
                disabled={disabled}
                onSelect={() => onSelect(match.fixtureId)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
