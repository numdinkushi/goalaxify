import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const SEED_FIXTURES = [
  {
    fixtureId: 1001,
    homeTeam: "Brazil",
    awayTeam: "Morocco",
    kickoffAt: "2026-07-06T20:00:00.000Z",
    status: "live" as const,
    round: "Round of 16",
    homeWinPct: 62,
    awayWinPct: 38,
    marketDeltaPct: 4.2,
    boothOpen: true,
    featured: true,
  },
  {
    fixtureId: 1002,
    homeTeam: "France",
    awayTeam: "Japan",
    kickoffAt: "2026-07-07T17:00:00.000Z",
    status: "scheduled" as const,
    round: "Quarter-final",
    homeWinPct: 55,
    awayWinPct: 45,
    marketDeltaPct: 1.8,
    boothOpen: false,
    featured: false,
  },
  {
    fixtureId: 1003,
    homeTeam: "Argentina",
    awayTeam: "Netherlands",
    kickoffAt: "2026-07-08T20:00:00.000Z",
    status: "scheduled" as const,
    round: "Quarter-final",
    homeWinPct: 58,
    awayWinPct: 42,
    marketDeltaPct: -0.6,
    boothOpen: false,
    featured: false,
  },
] as const;

const SEED_MOMENTS = [
  {
    fixtureId: 1001,
    minute: 12,
    homeScore: 1,
    awayScore: 0,
    eventType: "goal" as const,
    summary: "Brazil strike early from the edge of the box.",
  },
  {
    fixtureId: 1001,
    minute: 34,
    homeScore: 1,
    awayScore: 1,
    eventType: "goal" as const,
    summary: "Morocco equalise with a clinical counter.",
  },
  {
    fixtureId: 1001,
    minute: 45,
    homeScore: 1,
    awayScore: 1,
    eventType: "halftime" as const,
    summary: "All square at the break — booth still open.",
  },
] as const;

export const getFeaturedFixture = query({
  args: {},
  handler: async (ctx) => {
    const featured = await ctx.db
      .query("fixtures")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .first();

    return featured ?? null;
  },
});

export const getByFixtureId = query({
  args: { fixtureId: v.number() },
  handler: async (ctx, { fixtureId }) => {
    return ctx.db
      .query("fixtures")
      .withIndex("by_fixture_id", (q) => q.eq("fixtureId", fixtureId))
      .first();
  },
});

export const listFixtures = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("fixtures").collect();
  },
});

export const listMoments = query({
  args: { fixtureId: v.optional(v.number()) },
  handler: async (ctx, { fixtureId }) => {
    if (fixtureId === undefined) {
      return ctx.db.query("moments").order("desc").take(20);
    }

    return ctx.db
      .query("moments")
      .withIndex("by_fixture", (q) => q.eq("fixtureId", fixtureId))
      .order("desc")
      .collect();
  },
});

export const seed = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, { force }) => {
    const existing = await ctx.db.query("fixtures").first();
    if (existing && !force) {
      return { seeded: false, reason: "already_seeded" as const };
    }

    if (force) {
      for (const fixture of await ctx.db.query("fixtures").collect()) {
        await ctx.db.delete(fixture._id);
      }
      for (const moment of await ctx.db.query("moments").collect()) {
        await ctx.db.delete(moment._id);
      }
    }

    const now = Date.now();

    for (const fixture of SEED_FIXTURES) {
      await ctx.db.insert("fixtures", { ...fixture, updatedAt: now });
    }

    for (const moment of SEED_MOMENTS) {
      await ctx.db.insert("moments", { ...moment, createdAt: now });
    }

    return { seeded: true, fixtures: SEED_FIXTURES.length, moments: SEED_MOMENTS.length };
  },
});
