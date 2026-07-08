import { getDataProvider } from "@/lib/data";
import { isTxlineConfiguredForRequest } from "@/lib/data/txline/credentials-server";
import { MatchScheduleBoard } from "@/components/home/match-schedule-board";
import { UpcomingMatchesEmpty } from "@/components/home/upcoming-matches-empty";

export async function UpcomingMatchesSection() {
  const matches = await getDataProvider().getUpcomingMatches();

  if (matches.length === 0) {
    return (
      <UpcomingMatchesEmpty configured={await isTxlineConfiguredForRequest()} />
    );
  }

  return <MatchScheduleBoard matches={matches} />;
}
