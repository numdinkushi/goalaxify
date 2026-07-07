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
});
