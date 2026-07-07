import { LiveEmptyState } from "@/components/live/live-empty-state";
import { MomentFeed } from "@/components/live/moment-feed";
import { MatchDataUnavailable } from "@/components/match/match-data-unavailable";
import { AppRoute } from "@/lib/enums";
import { getDataProvider } from "@/lib/data";
import { findLiveMatch } from "@/lib/utils/match";

export async function LivePageContent() {
  const data = getDataProvider();
  const [upcomingMatches, moments] = await Promise.all([
    data.getUpcomingMatches(),
    data.getMoments(),
  ]);

  if (upcomingMatches.length === 0) {
    return (
      <MatchDataUnavailable
        title="Live feed unavailable"
        description="We need active TxLINE fixture data before the live pitch can open. Check back when matches are scheduled or in play."
      />
    );
  }

  const liveMatch = findLiveMatch(upcomingMatches);

  if (!liveMatch) {
    return (
      <LiveEmptyState
        upcomingMatches={upcomingMatches}
        homeHref={AppRoute.Home}
      />
    );
  }

  return (
    <MomentFeed
      moments={moments.filter(
        (moment) => moment.fixtureId === liveMatch.fixtureId,
      )}
      homeTeam={liveMatch.home.name}
      awayTeam={liveMatch.away.name}
    />
  );
}
