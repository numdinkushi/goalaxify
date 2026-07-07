"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MatchSpotlightCard } from "@/components/home/match-spotlight-card";
import { CollapsibleFixturePicker } from "@/components/match/collapsible-fixture-picker";
import { useTranslation } from "@/hooks/use-translation";
import { AppRoute } from "@/lib/enums";
import type { FeaturedMatchView } from "@/lib/data/types";
import { formatScheduleDayLabel } from "@/lib/utils/schedule";
import { findLiveMatch } from "@/lib/utils/match";

type MatchScheduleBoardProps = {
  matches: FeaturedMatchView[];
};

export function MatchScheduleBoard({ matches }: MatchScheduleBoardProps) {
  const { t } = useTranslation();
  const defaultFixtureId = matches[0]?.fixtureId ?? 0;
  const [selectedFixtureId, setSelectedFixtureId] = useState(defaultFixtureId);

  const selectedMatch = useMemo(
    () =>
      matches.find((match) => match.fixtureId === selectedFixtureId) ??
      matches[0],
    [matches, selectedFixtureId],
  );

  const liveMatch = useMemo(() => findLiveMatch(matches), [matches]);

  if (!selectedMatch) {
    return null;
  }

  const detailDayLabel = formatScheduleDayLabel(selectedMatch.kickoffAt);

  return (
    <div className="space-y-3">
      {liveMatch ? (
        <Link
          href={AppRoute.Live}
          className="flex items-center justify-between rounded-2xl border border-brand-coral/40 bg-brand-coral/10 px-4 py-3 text-sm transition-colors hover:bg-brand-coral/15"
        >
          <span>
            <span className="live-dot mr-2 inline-block" aria-hidden />
            <span className="font-medium">{liveMatch.home.name}</span>
            <span className="text-muted-foreground"> {t("match.vs")} </span>
            <span className="font-medium">{liveMatch.away.name}</span>
            <span className="text-muted-foreground"> {t("match.isLiveNow")}</span>
          </span>
          <span className="text-xs font-medium text-brand-coral">
            {t("match.openLive")}
          </span>
        </Link>
      ) : null}

      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-pastel-pink uppercase">
            {detailDayLabel}
          </p>
          <h3 className="text-lg font-semibold">
            {selectedMatch.home.name} vs {selectedMatch.away.name}
          </h3>
        </div>
        <MatchSpotlightCard match={selectedMatch} />
      </div>

      <CollapsibleFixturePicker
        matches={matches}
        selectedFixtureId={selectedFixtureId}
        onSelect={setSelectedFixtureId}
      />
    </div>
  );
}
