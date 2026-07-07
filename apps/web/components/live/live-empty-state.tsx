"use client";

import Link from "next/link";

import { FixtureScheduleRow } from "@/components/home/fixture-schedule-row";
import type { FeaturedMatchView } from "@/lib/data/types";
import { formatScheduleDayLabel } from "@/lib/utils/schedule";
import { buttonVariants } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

type LiveEmptyStateProps = {
  upcomingMatches: FeaturedMatchView[];
  homeHref: string;
};

export function LiveEmptyState({
  upcomingMatches,
  homeHref,
}: LiveEmptyStateProps) {
  const { t } = useTranslation();
  const nextMatch = upcomingMatches[0];

  return (
    <div className="space-y-5 rounded-3xl border border-border/80 bg-muted/30 p-5">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium">{t("live.noMatchTitle")}</p>
        <p className="text-sm text-muted-foreground">
          {t("live.noMatchDescription")}
        </p>
      </div>

      {nextMatch ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {t("match.nextUp")} · {formatScheduleDayLabel(nextMatch.kickoffAt)}
          </p>
          <FixtureScheduleRow match={nextMatch} selected readOnly />
        </div>
      ) : null}

      <Link
        href={homeHref}
        className={cn(buttonVariants({ variant: "default" }), "w-full")}
      >
        {t("live.browseMatches")}
      </Link>
    </div>
  );
}
