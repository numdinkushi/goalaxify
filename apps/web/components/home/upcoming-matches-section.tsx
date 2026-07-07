import { getDataProvider } from "@/lib/data";
import { isTxlineConfigured } from "@/lib/data/txline/enrich";
import { MatchScheduleBoard } from "@/components/home/match-schedule-board";
import { MatchDataUnavailable } from "@/components/match/match-data-unavailable";

export async function UpcomingMatchesSection() {
  const matches = await getDataProvider().getUpcomingMatches();

  if (matches.length === 0) {
    const configured = isTxlineConfigured();

    return (
      <MatchDataUnavailable
        title={
          configured
            ? "No match data right now"
            : "TxLINE is not connected"
        }
        description={
          configured
            ? "Live World Cup fixtures and odds aren't available from TxLINE at the moment. We won't show placeholder data — check back shortly."
            : "Add your TxLINE credentials and run setup to load live fixtures and odds. Until then, nothing is shown here."
        }
      />
    );
  }

  return <MatchScheduleBoard matches={matches} />;
}
