import type { Team } from "@goalaxify/domain";

import { HomeAwayMarker } from "@/components/match/home-away-marker";
import { cn } from "@/lib/utils";

type MatchTeamsTitleProps = {
  home: string;
  away: string;
  className?: string;
  versusClassName?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "text-sm",
  md: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
};

/** 🏠 HomeTeam vs AwayTeam ✈️ */
export function MatchTeamsTitle({
  home,
  away,
  className,
  versusClassName,
  size = "sm",
}: MatchTeamsTitleProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold",
        sizeClasses[size],
        className,
      )}
    >
      <HomeAwayMarker side="home" />
      <span>{home}</span>
      <span className={cn("font-normal text-muted-foreground", versusClassName)}>
        vs
      </span>
      <span>{away}</span>
      <HomeAwayMarker side="away" />
    </span>
  );
}

type MatchTeamsShowcaseProps = {
  home: Team;
  away: Team;
  className?: string;
};

/** Spotlight header: title row + flags underneath. */
export function MatchTeamsShowcase({
  home,
  away,
  className,
}: MatchTeamsShowcaseProps) {
  return (
    <div className={cn("space-y-3 text-center", className)}>
      <MatchTeamsTitle home={home.name} away={away.name} size="lg" />
      <div className="flex items-center justify-center gap-3 text-muted-foreground">
        <span className="text-2xl leading-none" aria-hidden>
          {home.flag}
        </span>
        <span className="text-[10px] font-medium tracking-[0.18em] uppercase">
          vs
        </span>
        <span className="text-2xl leading-none" aria-hidden>
          {away.flag}
        </span>
      </div>
      <div className="flex items-center justify-center gap-8 text-[11px] tracking-wide text-muted-foreground uppercase">
        <span>{home.code}</span>
        <span>{away.code}</span>
      </div>
    </div>
  );
}
