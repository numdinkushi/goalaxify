import { TrendingDown, TrendingUp, Mic } from "lucide-react";
import Link from "next/link";

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
import type { FeaturedMatchView } from "@/lib/data/types";
import { buildBoothHref } from "@/lib/data/booth-context";
import { formatMarketDelta } from "@/lib/utils/format";
import { getMatchStatusLabel, isMarketMoving, isMatchLive, deriveMatchStatus } from "@/lib/utils/match";
import { cn } from "@/lib/utils";

type MatchSpotlightCardProps = {
  match: FeaturedMatchView;
};

export function MatchSpotlightCard({ match }: MatchSpotlightCardProps) {
  const resolvedStatus = deriveMatchStatus(match.kickoffAt, match.status);
  const isLive = isMatchLive(resolvedStatus);
  const marketMoving =
    match.marketDeltaPct !== null && isMarketMoving(match.marketDeltaPct);
  const deltaPositive = (match.marketDeltaPct ?? 0) >= 0;
  const TrendIcon = deltaPositive ? TrendingUp : TrendingDown;
  const marketLabel = "TxLINE market";
  const metaParts = [
    match.round,
    match.venue !== match.round ? match.venue : null,
    match.boothOpen ? "Voice booth open" : null,
  ].filter(Boolean);

  return (
    <Card className="overflow-hidden border-border/80 goalaxify-card-shadow">
      <div className="h-1.5 bg-gradient-to-r from-brand-coral via-brand-pastel-pink to-brand-dusty-blue" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={isLive ? "live" : "outline"}>
            {getMatchStatusLabel(resolvedStatus).toUpperCase()}
          </Badge>
          <KickoffStatus kickoffAt={match.kickoffAt} status={resolvedStatus} />
        </div>

        <CardDescription className="pt-2">
          {metaParts.join(" · ")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <TeamDisplay team={match.home} align="right" />
          <div className="text-center">
            <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              vs
            </p>
          </div>
          <TeamDisplay team={match.away} align="left" />
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/50 p-4 space-y-4">
          <OddsBar
            odds={match.market}
            homeCode={match.home.code}
            awayCode={match.away.code}
            label={marketLabel}
            hint="What bookmakers think"
          />

          {match.crowd ? (
            <OddsBar
              odds={match.crowd}
              homeCode={match.home.code}
              awayCode={match.away.code}
              label="Goalaxify crowd"
              hint="Where fans are putting money"
              compact
            />
          ) : null}
        </div>

        <OutcomePicker
          odds={match.market}
          homeCode={match.home.code}
          awayCode={match.away.code}
        />

        {match.boothOpen ? (
          <Link
            href={buildBoothHref(match.fixtureId)}
            className={cn(buttonVariants({ variant: "default" }), "w-full")}
          >
            <Mic className="size-4" />
            Talk your bet
          </Link>
        ) : null}

        <p className="text-center text-xs text-muted-foreground">
          Pick who wins, if it&apos;s a draw, or who takes it away — shown as simple
          chances, not betting jargon.
        </p>

        {marketMoving && match.marketDeltaPct !== null ? (
          <div className="flex items-center justify-between rounded-xl border border-brand-mint/30 bg-brand-mint/10 px-4 py-3 text-sm">
            <span className="font-medium text-foreground">Odds shifting</span>
            <span
              className={`inline-flex items-center gap-1 font-semibold ${deltaPositive ? "text-success" : "text-destructive"}`}
            >
              <TrendIcon className="size-4" />
              {formatMarketDelta(match.marketDeltaPct)} on {match.home.name}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
