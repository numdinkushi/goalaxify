"use client";

import { useEffect } from "react";

import type { Doc } from "@goalaxify/convex/_generated/dataModel";

async function syncFixture(fixtureId: number) {
  try {
    await fetch("/api/settlement/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fixtureId }),
    });
  } catch {
    // Best-effort — Convex subscriptions will pick up resolved bets.
  }
}

export function useSyncSettlements(predictions: Doc<"predictions">[]) {
  const lockedFixtureIds = [
    ...new Set(
      predictions
        .filter((prediction) => prediction.status === "locked")
        .map((prediction) => prediction.fixtureId),
    ),
  ].join(",");

  useEffect(() => {
    if (!lockedFixtureIds) {
      return;
    }

    const fixtureIds = lockedFixtureIds.split(",").map(Number);

    const runSync = () => {
      for (const fixtureId of fixtureIds) {
        void syncFixture(fixtureId);
      }
    };

    const initialTimer = window.setTimeout(runSync, 400);
    const interval = window.setInterval(runSync, 15_000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [lockedFixtureIds]);
}
