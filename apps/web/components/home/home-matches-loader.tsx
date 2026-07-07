"use client";

import { LogoLoader } from "@/components/ui/logo-loader";
import { useTranslation } from "@/hooks/use-translation";

export function HomeMatchesLoader() {
  const { t } = useTranslation();
  return <LogoLoader message={t("home.loadingFixtures")} />;
}
