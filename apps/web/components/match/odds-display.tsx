import type { MatchOutcome, ThreeWayOdds } from "@goalaxify/domain";

import { OUTCOME_SHORT_LABELS } from "@/lib/data/types";
import { formatPercentage, formatReturnMultiplier } from "@/lib/utils/format";
import { getOutcomeValue } from "@/lib/utils/odds";
import { cn } from "@/lib/utils";

const OUTCOMES: MatchOutcome[] = ["home", "draw", "away"];

const OUTCOME_COLORS: Record<MatchOutcome, string> = {
  home: "var(--odds-home)",
  draw: "var(--odds-draw)",
  away: "var(--odds-away)",
};

type OddsBarProps = {
  odds: ThreeWayOdds;
  homeCode: string;
  awayCode: string;
  label: string;
  hint?: string;
  compact?: boolean;
};

export function OddsBar({
  odds,
  homeCode,
  awayCode,
  label,
  hint,
  compact = false,
}: OddsBarProps) {
  const labels: Record<MatchOutcome, string> = {
    home: homeCode,
    draw: OUTCOME_SHORT_LABELS.draw,
    away: awayCode,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>

      <div className="odds-track">
        {OUTCOMES.map((outcome) => {
          const { pct } = getOutcomeValue(odds, outcome);
          return (
            <div
              key={outcome}
              className="odds-track-segment"
              style={{
                width: `${pct}%`,
                background: OUTCOME_COLORS[outcome],
              }}
              title={`${labels[outcome]} ${formatPercentage(pct)}`}
            />
          );
        })}
      </div>

      <div
        className={cn(
          "grid grid-cols-3 gap-2 font-mono text-muted-foreground",
          compact ? "text-[10px]" : "text-[11px]",
        )}
      >
        {OUTCOMES.map((outcome) => {
          const { pct, returnMultiplier } = getOutcomeValue(odds, outcome);
          return (
            <div key={outcome} className="text-center">
              <p className="font-semibold text-foreground">
                {labels[outcome]} {formatPercentage(pct)}
              </p>
              {!compact && (
                <p className="mt-0.5">
                  {formatReturnMultiplier(returnMultiplier)} return
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type OutcomePickerProps = {
  odds: ThreeWayOdds;
  homeCode: string;
  awayCode: string;
};

export function OutcomePicker({ odds, homeCode, awayCode }: OutcomePickerProps) {
  const labels: Record<MatchOutcome, string> = {
    home: homeCode,
    draw: OUTCOME_SHORT_LABELS.draw,
    away: awayCode,
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {OUTCOMES.map((outcome) => {
        const { pct, returnMultiplier } = getOutcomeValue(odds, outcome);
        return (
          <div
            key={outcome}
            className="rounded-xl border border-border/80 bg-card/60 px-2 py-3 text-center"
          >
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {labels[outcome]}
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {formatPercentage(pct)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {formatReturnMultiplier(returnMultiplier)} if right
            </p>
          </div>
        );
      })}
    </div>
  );
}
