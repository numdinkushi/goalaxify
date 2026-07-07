import type { MatchOutcome } from "@goalaxify/domain";
import { Home, Minus, Plane } from "lucide-react";

import { OUTCOME_LABELS } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const OUTCOME_ICONS: Record<
  MatchOutcome,
  typeof Home | typeof Plane | typeof Minus
> = {
  home: Home,
  away: Plane,
  draw: Minus,
};

type MatchTeamTitleProps = {
  homeTeam: string;
  awayTeam: string;
  className?: string;
};

export function MatchTeamTitle({
  homeTeam,
  awayTeam,
  className,
}: MatchTeamTitleProps) {
  return (
    <span
      dir="ltr"
      className={cn("inline-flex flex-wrap items-center gap-x-1.5 gap-y-1", className)}
    >
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <Home className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span>{homeTeam}</span>
      </span>
      <span className="shrink-0 text-muted-foreground">vs</span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <span>{awayTeam}</span>
        <Plane className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      </span>
    </span>
  );
}

type OutcomeLabelProps = {
  outcome: MatchOutcome | string;
  className?: string;
};

export function OutcomeLabel({ outcome, className }: OutcomeLabelProps) {
  const key = outcome as MatchOutcome;
  const Icon = OUTCOME_ICONS[key];
  const label = OUTCOME_LABELS[key] ?? outcome;

  if (!Icon) {
    return <span className={className}>{label}</span>;
  }

  return (
    <span
      dir="ltr"
      className={cn("inline-flex items-center gap-1 whitespace-nowrap", className)}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span>{label}</span>
    </span>
  );
}
