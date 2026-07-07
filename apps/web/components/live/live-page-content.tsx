import { LiveEmptyState } from "@/components/live/live-empty-state";
import { LiveFeedClient } from "@/components/live/live-feed-client";
import { LiveFeedUnavailable } from "@/components/live/live-feed-unavailable";
import { AppRoute } from "@/lib/enums";
import { getDataProvider } from "@/lib/data";
import { findLiveMatch } from "@/lib/utils/match";

export async function LivePageContent() {
  const data = getDataProvider();
  const upcomingMatches = await data.getUpcomingMatches();

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

  const moments = await data.getMoments(liveMatch.fixtureId);

  return (
    <LiveFeedClient
      fixtureId={liveMatch.fixtureId}
      homeTeam={liveMatch.home.name}
      awayTeam={liveMatch.away.name}
      initialMoments={moments}
    />
  );
}
