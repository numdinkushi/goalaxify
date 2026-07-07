import { TrendingDown, TrendingUp } from "lucide-react";

import { KickoffStatus } from "@/components/match/kickoff-status";
import { OddsBar, OutcomePicker } from "@/components/match/odds-display";
import { TeamDisplay } from "@/components/match/team-display";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { FeaturedMatchView } from "@/lib/data/types";
import { OddsSource } from "@/lib/enums";
import { formatMarketDelta } from "@/lib/utils/format";
import { getMatchStatusLabel, isMarketMoving, isMatchLive } from "@/lib/utils/match";

type MatchSpotlightCardProps = {
  match: FeaturedMatchView;
};

export function MatchSpotlightCard({ match }: MatchSpotlightCardProps) {
  const isLive = isMatchLive(match.status);
  const marketMoving = isMarketMoving(match.marketDeltaPct);
  const deltaPositive = match.marketDeltaPct >= 0;
  const TrendIcon = deltaPositive ? TrendingUp : TrendingDown;
  const marketLabel =
    match.oddsSource === OddsSource.Txline ? "TxLINE market" : "Market odds";
  const crowdLabel = "Goalaxify crowd";

  return (
    <Card className="overflow-hidden border-border/80 goalaxify-card-shadow">
      <div className="h-1.5 bg-gradient-to-r from-brand-coral via-brand-pastel-pink to-brand-dusty-blue" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={isLive ? "live" : "outline"}>
            {getMatchStatusLabel(match.status).toUpperCase()}
          </Badge>
          <KickoffStatus kickoffAt={match.kickoffAt} status={match.status} />
        </div>

        <CardDescription className="pt-2">
          {match.round} · {match.venue}
          {match.boothOpen ? " · Voice booth open" : ""}
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

          <OddsBar
            odds={match.crowd}
            homeCode={match.home.code}
            awayCode={match.away.code}
            label={crowdLabel}
            hint="Where fans are putting money"
            compact
          />
        </div>

        <OutcomePicker
          odds={match.market}
          homeCode={match.home.code}
          awayCode={match.away.code}
        />

        <p className="text-center text-xs text-muted-foreground">
          Pick who wins, if it&apos;s a draw, or who takes it away — shown as simple
          chances, not betting jargon.
        </p>

        {marketMoving && (
          <div className="flex items-center justify-between rounded-xl border border-brand-mint/30 bg-brand-mint/10 px-4 py-3 text-sm">
            <span className="font-medium text-foreground">Odds shifting</span>
            <span
              className={`inline-flex items-center gap-1 font-semibold ${deltaPositive ? "text-success" : "text-destructive"}`}
            >
              <TrendIcon className="size-4" />
              {formatMarketDelta(match.marketDeltaPct)} on {match.home.name}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
