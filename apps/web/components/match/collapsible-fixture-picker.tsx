"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { FixtureScheduleList } from "@/components/home/fixture-schedule-list";
import type { FeaturedMatchView } from "@/lib/data/types";
import { cn } from "@/lib/utils";

type CollapsibleFixturePickerProps = {
  matches: FeaturedMatchView[];
  selectedFixtureId: number;
  onSelect: (fixtureId: number) => void;
  disabled?: boolean;
  defaultOpen?: boolean;
};

export function CollapsibleFixturePicker({
  matches,
  selectedFixtureId,
  onSelect,
  disabled = false,
  defaultOpen = false,
}: CollapsibleFixturePickerProps) {
  const [open, setOpen] = useState(defaultOpen);

  const selectedMatch =
    matches.find((match) => match.fixtureId === selectedFixtureId) ??
    matches[0];

  function handleSelect(fixtureId: number) {
    onSelect(fixtureId);
    setOpen(false);
  }

  if (matches.length <= 1) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-start justify-between gap-3 px-4 text-left",
          open ? "py-3" : "py-2.5",
        )}
      >
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium leading-tight">
            {open ? "All upcoming matches" : "Browse other matches"}
          </p>
          <p className="truncate text-xs leading-snug text-muted-foreground">
            {open
              ? `${matches.length} fixtures · tap one to switch`
              : selectedMatch
                ? `Currently ${selectedMatch.home.name} vs ${selectedMatch.away.name}`
                : `${matches.length} fixtures available`}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border/70 px-4 pb-4 pt-3">
          {disabled ? (
            <p className="text-xs text-muted-foreground">
              End your voice session to switch matches.
            </p>
          ) : null}
          <FixtureScheduleList
            matches={matches}
            selectedFixtureId={selectedFixtureId}
            onSelect={handleSelect}
            disabled={disabled}
          />
        </div>
      ) : null}
    </div>
  );
}
