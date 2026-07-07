import type { Team } from "@goalaxify/domain";

import { cn } from "@/lib/utils";

type TeamDisplayProps = {
  team: Team;
  align?: "left" | "right" | "center";
  highlight?: boolean;
  compact?: boolean;
};

export function TeamDisplay({
  team,
  align = "left",
  highlight = false,
  compact = false,
}: TeamDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        align === "right" && "flex-row-reverse text-right",
        align === "center" && "flex-col text-center",
      )}
    >
      <span className={cn("leading-none", compact ? "text-xl" : "text-2xl")} aria-hidden>
        {team.flag}
      </span>
      <div className={cn(align === "center" && "text-center")}>
        <p
          className={cn(
            "font-semibold",
            compact ? "text-sm" : "text-sm sm:text-base",
            highlight && "text-brand-pastel-pink",
          )}
        >
          {team.name}
        </p>
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
          {team.code}
        </p>
      </div>
    </div>
  );
}
