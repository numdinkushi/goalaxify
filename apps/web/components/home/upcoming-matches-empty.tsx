"use client";

import { MatchDataUnavailable } from "@/components/match/match-data-unavailable";
import { useTranslation } from "@/hooks/use-translation";

type UpcomingMatchesEmptyProps = {
  configured: boolean;
};

export function UpcomingMatchesEmpty({ configured }: UpcomingMatchesEmptyProps) {
  const { t } = useTranslation();

  return (
    <MatchDataUnavailable
      title={
        configured
          ? t("home.noMatchDataTitle")
          : t("home.txlineNotConnectedTitle")
      }
      description={
        configured
          ? t("home.noMatchDataDescription")
          : t("home.txlineNotConnectedDescription")
      }
    />
  );
}
