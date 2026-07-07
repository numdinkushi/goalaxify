import { LiveEmptyState } from "@/components/live/live-empty-state";
import { LiveFeedUnavailable } from "@/components/live/live-feed-unavailable";
import { MomentFeed } from "@/components/live/moment-feed";
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
    return <LiveFeedUnavailable />;
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
