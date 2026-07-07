import { BrandLogo } from "@/components/brand/brand-logo";
import { HeroVideoBackground } from "@/components/home/hero-video-background";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <HeroVideoBackground>
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
          World Cup 2026
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight text-foreground drop-shadow-sm sm:text-5xl">
          Goalaxify
        </h1>
      </div>

      <p className="mt-3 max-w-xs text-2xl leading-tight font-bold text-brand-coral drop-shadow-sm sm:text-3xl">
        Talk your bet.
      </p>

      <p className="mt-3 max-w-sm text-sm leading-relaxed text-foreground/80 sm:text-base">
        Voice predictions, live goal moments, and verified settlement — built
        for fans who want the match to feel alive.
      </p>
    </HeroVideoBackground>
  );
}
