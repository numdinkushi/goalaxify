import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";

import { AppRoute } from "@/lib/enums";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MatchDataUnavailableProps = {
  title?: string;
  description?: string;
  showRefreshHint?: boolean;
};

export function MatchDataUnavailable({
  title = "No match data right now",
  description = "We couldn't load live fixtures or odds from TxLINE at the moment. This usually clears up quickly — try again in a few minutes.",
  showRefreshHint = true,
}: MatchDataUnavailableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/60 goalaxify-card-shadow">
      <div className="h-1.5 bg-gradient-to-r from-brand-coral/40 via-brand-pastel-pink/40 to-brand-dusty-blue/40" />

      <div className="flex flex-col items-center px-6 py-10 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/50 text-muted-foreground">
          <WifiOff className="size-6" aria-hidden />
        </div>

        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {showRefreshHint ? (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="size-3.5" aria-hidden />
              Refresh the page to retry
            </span>
          ) : null}
          <Link
            href={AppRoute.Settings}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Check connection
          </Link>
        </div>
      </div>
    </div>
  );
}
