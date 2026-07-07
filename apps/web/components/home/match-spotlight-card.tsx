"use client";

import { Lock, Mic, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Doc } from "@goalaxify/convex/_generated/dataModel";

import { KickoffStatus } from "@/components/match/kickoff-status";
import { OddsBar, OutcomePicker } from "@/components/match/odds-display";
import { TeamDisplay } from "@/components/match/team-display";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { usePredictions } from "@/hooks/use-predictions";
import { useLockPredictionsOnKickoff } from "@/hooks/use-lock-predictions-on-kickoff";
import { useTranslation } from "@/hooks/use-translation";
import {
  BET_PLACED_IN_PLAY_LABEL,
  getBoothStatusLabel,
} from "@/lib/constants/match-copy";
import {
  buildBoothHref,
  buildManageBoothHref,
} from "@/lib/data/booth-context";
import type { FeaturedMatchView } from "@/lib/data/types";
import { formatMarketDelta } from "@/lib/utils/format";
import {
  deriveMatchStatus,
  getMatchStatusLabel,
  isBoothOpenForMatch,
  isMarketMoving,
  isMatchLive,
} from "@/lib/utils/match";
import { cn } from "@/lib/utils";

type MatchSpotlightCardProps = {
  match: FeaturedMatchView;
};

function resolveBoothStatusLabel(
  match: FeaturedMatchView,
): string {
  return match.boothStatusLabel ?? getBoothStatusLabel(match.boothOpen);
}

export function MatchSpotlightCard({ match }: MatchSpotlightCardProps) {
  const { t } = useTranslation();
  const { predictions } = usePredictions("open");

  const [displayStatus, setDisplayStatus] = useState(match.status);
  const [boothOpen, setBoothOpen] = useState(match.boothOpen);
  const [boothLabel, setBoothLabel] = useState(() =>
    resolveBoothStatusLabel(match),
  );
  const [existingBet, setExistingBet] = useState<
    Doc<"predictions"> | undefined
  >(undefined);

  useEffect(() => {
    const liveStatus = deriveMatchStatus(match.kickoffAt, match.status);
    const open = isBoothOpenForMatch(match.kickoffAt, liveStatus);

    setDisplayStatus(liveStatus);
    setBoothOpen(open);
    setBoothLabel(getBoothStatusLabel(open));
  }, [match.kickoffAt, match.status]);

  useEffect(() => {
    setExistingBet(
      predictions.find(
        (prediction) => prediction.fixtureId === match.fixtureId,
      ),
    );
  }, [match.fixtureId, predictions]);

  useLockPredictionsOnKickoff(match.fixtureId, match.kickoffAt, match.status);

  const isLive = isMatchLive(displayStatus);
  const marketMoving =
    match.marketDeltaPct !== null && isMarketMoving(match.marketDeltaPct);
  const deltaPositive = (match.marketDeltaPct ?? 0) >= 0;
  const TrendIcon = deltaPositive ? TrendingUp : TrendingDown;
  const metaParts = [
    match.round,
    match.venue !== match.round ? match.venue : null,
    boothLabel,
  ].filter(Boolean);

  return (
    <Card className="overflow-hidden border-border/80 goalaxify-card-shadow">
      <div className="h-1.5 bg-gradient-to-r from-brand-coral via-brand-pastel-pink to-brand-dusty-blue" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={isLive ? "live" : "outline"}>
            {getMatchStatusLabel(displayStatus).toUpperCase()}
          </Badge>
          <KickoffStatus kickoffAt={match.kickoffAt} status={displayStatus} />
        </div>

        <CardDescription className="pt-2" suppressHydrationWarning>
          {metaParts.join(" · ")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <TeamDisplay team={match.home} align="right" />
          <div className="text-center">
            <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              {t("match.vs")}
            </p>
          </div>
          <TeamDisplay team={match.away} align="left" />
        </div>

        <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/50 p-4">
          <OddsBar
            odds={match.market}
            homeCode={match.home.code}
            awayCode={match.away.code}
            label={t("match.txlineMarket")}
            hint={t("match.marketHint")}
          />

          {match.crowd ? (
            <OddsBar
              odds={match.crowd}
              homeCode={match.home.code}
              awayCode={match.away.code}
              label={t("match.crowdLabel")}
              hint={t("match.crowdHint")}
              compact
            />
          ) : null}
        </div>

        <OutcomePicker
          odds={match.market}
          homeCode={match.home.code}
          awayCode={match.away.code}
        />

        {!boothOpen ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0" />
            <span suppressHydrationWarning>
              {existingBet ? BET_PLACED_IN_PLAY_LABEL : boothLabel}
            </span>
          </div>
        ) : existingBet ? (
          <Link
            href={buildManageBoothHref(match.fixtureId, existingBet._id)}
            className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
          >
            <Mic className="size-4" />
            {t("match.manageYourBet")}
          </Link>
        ) : (
          <Link
            href={buildBoothHref(match.fixtureId)}
            className={cn(buttonVariants({ variant: "default" }), "w-full")}
          >
            <Mic className="size-4" />
            {t("match.talkYourBet")}
          </Link>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {t("match.oddsHelp")}
        </p>

        {marketMoving && match.marketDeltaPct !== null ? (
          <div className="flex items-center justify-between rounded-xl border border-brand-mint/30 bg-brand-mint/10 px-4 py-3 text-sm">
            <span className="font-medium text-foreground">
              {t("match.oddsShifting")}
            </span>
            <span
              className={`inline-flex items-center gap-1 font-semibold ${deltaPositive ? "text-success" : "text-destructive"}`}
            >
              <TrendIcon className="size-4" />
              {formatMarketDelta(match.marketDeltaPct)} {t("match.oddsShiftOn")}{" "}
              {match.home.name}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
