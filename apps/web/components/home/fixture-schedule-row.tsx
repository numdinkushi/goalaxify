"use client";

import { Badge } from "@/components/ui/badge";
import type { FeaturedMatchView } from "@/lib/data/types";
import { formatKickoffTime } from "@/lib/utils/format";
import {
  deriveMatchStatus,
  getMatchStatusLabel,
  isMatchLive,
} from "@/lib/utils/match";
import { cn } from "@/lib/utils";

type FixtureScheduleRowProps = {
  match: FeaturedMatchView;
  selected?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

export function FixtureScheduleRow({
  match,
  selected = false,
  readOnly = false,
  disabled = false,
  onSelect,
}: FixtureScheduleRowProps) {
  const status = deriveMatchStatus(match.kickoffAt, match.status);
  const live = isMatchLive(status);

  const className = cn(
    "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
    selected
      ? "border-brand-coral/50 bg-brand-coral/10"
      : "border-border/70 bg-card/60",
    disabled && "cursor-not-allowed opacity-60",
    !readOnly && !disabled && !selected && "hover:border-border hover:bg-muted/40",
  );

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {match.home.name} vs {match.away.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{match.round}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {formatKickoffTime(match.kickoffAt)}
          </span>
          {live ? (
            <Badge variant="live" className="h-5 px-2 text-[10px]">
              LIVE
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground">
              {getMatchStatusLabel(status)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{match.home.flag}</span>
          <span className="text-[10px] text-muted-foreground">vs</span>
          <span className="text-base leading-none">{match.away.flag}</span>
        </div>
        {selected && !readOnly ? (
          <span className="text-[10px] font-medium text-brand-coral">
            Selected
          </span>
        ) : null}
      </div>
    </>
  );

  if (readOnly) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={className}
    >
      {content}
    </button>
  );
}
