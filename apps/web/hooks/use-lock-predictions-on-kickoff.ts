"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";

import { api } from "@goalaxify/convex/_generated/api";
import { isConvexConfigured } from "@/lib/env/runtime";
import type { MatchStatus } from "@/lib/enums";
import {
  deriveMatchStatus,
  isBoothOpenForMatch,
} from "@/lib/utils/match";

export function useLockPredictionsOnKickoff(
  fixtureId: number | undefined,
  kickoffAt: string,
  status: MatchStatus,
) {
  const lockPredictions = useMutation(api.predictions.lockOpenPredictions);
  const resolvedStatus = deriveMatchStatus(kickoffAt, status);
  const boothLocked = !isBoothOpenForMatch(kickoffAt, resolvedStatus);

  useEffect(() => {
    if (!boothLocked || !fixtureId || !isConvexConfigured()) return;
    void lockPredictions({ fixtureId });
  }, [boothLocked, fixtureId, lockPredictions]);
}
