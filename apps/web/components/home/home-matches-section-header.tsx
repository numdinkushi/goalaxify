"use client";

import { useTranslation } from "@/hooks/use-translation";

export function HomeMatchesSectionHeader() {
  const { t } = useTranslation();

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-brand-pastel-pink uppercase">
        {t("hero.worldCup")}
      </p>
      <h2 className="text-lg font-semibold">{t("home.predictMatch")}</h2>
    </div>
  );
}
