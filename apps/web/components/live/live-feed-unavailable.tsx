"use client";

import { MatchDataUnavailable } from "@/components/match/match-data-unavailable";
import { useTranslation } from "@/hooks/use-translation";

export function LiveFeedUnavailable() {
  const { t } = useTranslation();

  return (
    <MatchDataUnavailable
      title={t("live.unavailableTitle")}
      description={t("live.unavailableDescription")}
    />
  );
}
