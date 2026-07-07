"use client";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";

export function HeroSectionContent() {
  const { t } = useTranslation();

  return (
    <>
      <div className="absolute top-4 left-4 z-20 sm:top-5 sm:left-6">
        <BrandLogo size={64} />
      </div>

      <div className="absolute top-4 right-4 z-20 sm:top-5 sm:right-6">
        <ConnectWalletButton
          size="sm"
          className="border-white/20 bg-black/30 backdrop-blur-sm"
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <Badge
          variant="outline"
          className="border-white/20 bg-black/20 text-foreground backdrop-blur-sm"
        >
          {t("hero.worldCup")}
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight text-foreground drop-shadow-sm sm:text-5xl">
          Goalaxify
        </h1>
      </div>

      <p className="mt-3 max-w-xs text-2xl leading-tight font-bold text-brand-coral drop-shadow-sm sm:text-3xl">
        {t("hero.tagline")}
      </p>

      <p className="mt-3 max-w-sm text-sm leading-relaxed text-foreground/80 sm:text-base">
        {t("hero.description")}
      </p>
    </>
  );
}
