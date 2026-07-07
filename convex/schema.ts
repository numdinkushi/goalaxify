import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const matchStatusValidator = v.union(
  v.literal("scheduled"),
  v.literal("live"),
  v.literal("halftime"),
  v.literal("finished"),
);

export const momentEventTypeValidator = v.union(
  v.literal("goal"),
  v.literal("halftime"),
  v.literal("fulltime"),
);

export const predictionStatusValidator = v.union(
  v.literal("open"),
  v.literal("locked"),
  v.literal("won"),
  v.literal("lost"),
  v.literal("settled"),
);

export const predictionMarketValidator = v.union(
  v.literal("match_winner"),
  v.literal("over_under"),
  v.literal("both_teams_score"),
);

export const stakeTokenValidator = v.union(
  v.literal("SOL"),
  v.literal("USDC"),
);

export const stakeMethodValidator = v.union(
  v.literal("txoracle_intent"),
  v.literal("native_pool"),
);

export default defineSchema({
  fixtures: defineTable({
    fixtureId: v.number(),
    homeTeam: v.string(),
    awayTeam: v.string(),
    kickoffAt: v.string(),
    status: matchStatusValidator,
    round: v.string(),
    homeWinPct: v.number(),
    awayWinPct: v.number(),
    marketDeltaPct: v.number(),
    boothOpen: v.boolean(),
    featured: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_fixture_id", ["fixtureId"])
    .index("by_featured", ["featured"]),

  moments: defineTable({
    fixtureId: v.number(),
    minute: v.number(),
    homeScore: v.number(),
    awayScore: v.number(),
    eventType: momentEventTypeValidator,
    summary: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_fixture", ["fixtureId"]),

  profiles: defineTable({
    walletPubkey: v.string(),
    displayName: v.optional(v.string()),
    walletName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    lastConnectedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_wallet", ["walletPubkey"]),

  predictions: defineTable({
    walletPubkey: v.string(),
    fixtureId: v.number(),
    homeTeam: v.string(),
    awayTeam: v.string(),
    kickoffAt: v.optional(v.string()),
    round: v.optional(v.string()),
    market: predictionMarketValidator,
    selection: v.string(),
    stakeToken: stakeTokenValidator,
    stakeAmount: v.number(),
    stakeBaseUnits: v.string(),
    stakeMethod: stakeMethodValidator,
    status: predictionStatusValidator,
    intentId: v.optional(v.string()),
    intentTxSig: v.optional(v.string()),
    claimTxSig: v.optional(v.string()),
    termsHash: v.optional(v.string()),
    estimatedReturn: v.optional(v.number()),
    payoutAmount: v.optional(v.number()),
    payoutBaseUnits: v.optional(v.string()),
    vapiCallId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_wallet", ["walletPubkey"])
    .index("by_fixture", ["fixtureId"])
    .index("by_status", ["status"])
    .index("by_wallet_status", ["walletPubkey", "status"]),
});
