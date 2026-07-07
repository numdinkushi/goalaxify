import { BoothPageContent } from "@/components/booth/booth-page-content";
import { MatchDataUnavailable } from "@/components/match/match-data-unavailable";
import { getDataProvider } from "@/lib/data";
import { isTxlineConfigured } from "@/lib/data/txline/enrich";

type BoothMatchesSectionProps = {
  initialFixtureId?: number;
  managePredictionId?: string;
};

export async function BoothMatchesSection({
  initialFixtureId,
  managePredictionId,
}: BoothMatchesSectionProps) {
  const matches = await getDataProvider().getUpcomingMatches();

  if (matches.length === 0) {
    const configured = isTxlineConfigured();

    return (
      <MatchDataUnavailable
        title={
          configured
            ? "Booth unavailable"
            : "TxLINE is not connected"
        }
        description={
          configured
            ? "We need live fixture data from TxLINE before you can place a voice prediction. Please try again when matches are available."
            : "Connect TxLINE to load upcoming matches for the prediction booth."
        }
      />
    );
  }

  return (
    <BoothPageContent
      matches={matches}
      initialFixtureId={initialFixtureId}
      managePredictionId={managePredictionId}
    />
  );
}
