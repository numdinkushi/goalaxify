import Link from "next/link";

import { FixtureScheduleRow } from "@/components/home/fixture-schedule-row";
import type { FeaturedMatchView } from "@/lib/data/types";
import { formatScheduleDayLabel } from "@/lib/utils/schedule";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LiveEmptyStateProps = {
  upcomingMatches: FeaturedMatchView[];
  homeHref: string;
};

export function LiveEmptyState({
  upcomingMatches,
  homeHref,
}: LiveEmptyStateProps) {
  const nextMatch = upcomingMatches[0];

  return (
    <div className="space-y-5 rounded-3xl border border-border/80 bg-muted/30 p-5">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium">No match in play right now</p>
        <p className="text-sm text-muted-foreground">
          The live feed opens automatically when a World Cup fixture kicks off.
          You can still predict on upcoming matches from home.
        </p>
      </div>

      {nextMatch ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Next up · {formatScheduleDayLabel(nextMatch.kickoffAt)}
          </p>
          <FixtureScheduleRow match={nextMatch} selected readOnly />
        </div>
      ) : null}

      <Link
        href={homeHref}
        className={cn(buttonVariants({ variant: "default" }), "w-full")}
      >
        Browse upcoming matches
      </Link>
    </div>
  );
}
