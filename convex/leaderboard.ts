import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { query } from "./_generated/server";

type LeaderboardEntry = {
  walletPubkey: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalWinnings: number;
  wins: number;
  settledBets: number;
  lastWinAt: number | null;
};

async function resolveAvatarUrl(
  ctx: QueryCtx,
  profile: { avatarUrl?: string; avatarStorageId?: Id<"_storage"> },
) {
  if (profile.avatarUrl) {
    return profile.avatarUrl;
  }

  if (profile.avatarStorageId) {
    return await ctx.storage.getUrl(profile.avatarStorageId);
  }

  return null;
}

export const listTopWinners = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 25 }) => {
    const settled = await ctx.db
      .query("predictions")
      .withIndex("by_status", (q) => q.eq("status", "settled"))
      .collect();

    const claimable = await ctx.db
      .query("predictions")
      .withIndex("by_status", (q) => q.eq("status", "won"))
      .collect();

    const winners = [...settled, ...claimable];
    const aggregates = new Map<string, LeaderboardEntry>();

    for (const prediction of winners) {
      const payout = prediction.payoutAmount ?? prediction.estimatedReturn ?? 0;
      const existing = aggregates.get(prediction.walletPubkey);

      if (existing) {
        existing.totalWinnings += payout;
        existing.wins += 1;
        existing.settledBets += 1;
        existing.lastWinAt = Math.max(
          existing.lastWinAt ?? 0,
          prediction.resolvedAt ?? prediction.updatedAt,
        );
        continue;
      }

      aggregates.set(prediction.walletPubkey, {
        walletPubkey: prediction.walletPubkey,
        displayName: null,
        avatarUrl: null,
        totalWinnings: payout,
        wins: 1,
        settledBets: 1,
        lastWinAt: prediction.resolvedAt ?? prediction.updatedAt,
      });
    }

    const entries = Array.from(aggregates.values()).sort((a, b) => {
      if (b.totalWinnings !== a.totalWinnings) {
        return b.totalWinnings - a.totalWinnings;
      }
      return b.wins - a.wins;
    });

    const enriched = await Promise.all(
      entries.slice(0, limit).map(async (entry) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_wallet", (q) => q.eq("walletPubkey", entry.walletPubkey))
          .first();

        if (!profile) {
          return entry;
        }

        return {
          ...entry,
          displayName: profile.displayName ?? null,
          avatarUrl: await resolveAvatarUrl(ctx, profile),
        };
      }),
    );

    return enriched;
  },
});

export const listRecentWins = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const settled = await ctx.db
      .query("predictions")
      .withIndex("by_status", (q) => q.eq("status", "settled"))
      .collect();

    const claimable = await ctx.db
      .query("predictions")
      .withIndex("by_status", (q) => q.eq("status", "won"))
      .collect();

    const wins = [...settled, ...claimable]
      .sort(
        (a, b) =>
          (b.resolvedAt ?? b.updatedAt) - (a.resolvedAt ?? a.updatedAt),
      )
      .slice(0, limit);

    return Promise.all(
      wins.map(async (prediction) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_wallet", (q) =>
            q.eq("walletPubkey", prediction.walletPubkey),
          )
          .first();

        return {
          ...prediction,
          displayName: profile?.displayName ?? null,
          avatarUrl: profile ? await resolveAvatarUrl(ctx, profile) : null,
        };
      }),
    );
  },
});
