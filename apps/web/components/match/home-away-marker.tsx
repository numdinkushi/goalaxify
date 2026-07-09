import { Home, Plane } from "lucide-react";

import { cn } from "@/lib/utils";

type HomeAwayMarkerProps = {
  side: "home" | "away";
  className?: string;
  showLabel?: boolean;
};

export function HomeAwayMarker({
  side,
  className,
  showLabel = false,
}: HomeAwayMarkerProps) {
  const Icon = side === "home" ? Home : Plane;
  const label = side === "home" ? "Home" : "Away";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-muted-foreground",
        className,
      )}
      title={label}
    >
      <Icon className="size-3.5" aria-hidden />
      {showLabel ? (
        <span className="text-[10px] font-medium tracking-wide uppercase">
          {label}
        </span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}
