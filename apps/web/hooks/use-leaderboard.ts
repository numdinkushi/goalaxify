"use client";

import { useQuery } from "convex/react";

import { api } from "@goalaxify/convex/_generated/api";
import { isConvexConfigured } from "@/lib/env/runtime";

export function useLeaderboard(limit = 25) {
  const enabled = isConvexConfigured();

  const topWinners = useQuery(
    api.leaderboard.listTopWinners,
    enabled ? { limit } : "skip",
  );

  const recentWins = useQuery(
    api.leaderboard.listRecentWins,
    enabled ? { limit: 15 } : "skip",
  );

  return {
    topWinners: topWinners ?? [],
    recentWins: recentWins ?? [],
    loading: enabled && (topWinners === undefined || recentWins === undefined),
  };
}
