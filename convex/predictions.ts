import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  predictionMarketValidator,
  predictionStatusValidator,
  stakeMethodValidator,
  stakeTokenValidator,
} from "./schema";

function normalizeWalletPubkey(walletPubkey: string): string {
  return walletPubkey.trim();
}

export const create = mutation({
  args: {
    walletPubkey: v.string(),
    fixtureId: v.number(),
    homeTeam: v.string(),
    awayTeam: v.string(),
    market: predictionMarketValidator,
    selection: v.string(),
    stakeToken: stakeTokenValidator,
    stakeAmount: v.number(),
    stakeBaseUnits: v.string(),
    stakeMethod: stakeMethodValidator,
    intentId: v.optional(v.string()),
    intentTxSig: v.optional(v.string()),
    termsHash: v.optional(v.string()),
    estimatedReturn: v.optional(v.number()),
    vapiCallId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const walletPubkey = normalizeWalletPubkey(args.walletPubkey);

    return ctx.db.insert("predictions", {
      walletPubkey,
      fixtureId: args.fixtureId,
      homeTeam: args.homeTeam,
      awayTeam: args.awayTeam,
      market: args.market,
      selection: args.selection,
      stakeToken: args.stakeToken,
      stakeAmount: args.stakeAmount,
      stakeBaseUnits: args.stakeBaseUnits,
      stakeMethod: args.stakeMethod,
      status: "open",
      intentId: args.intentId,
      intentTxSig: args.intentTxSig,
      termsHash: args.termsHash,
      estimatedReturn: args.estimatedReturn,
      vapiCallId: args.vapiCallId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listByWallet = query({
  args: {
    walletPubkey: v.string(),
    status: v.optional(predictionStatusValidator),
  },
  handler: async (ctx, { walletPubkey, status }) => {
    const normalized = normalizeWalletPubkey(walletPubkey);
    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_wallet", (q) => q.eq("walletPubkey", normalized))
      .order("desc")
      .collect();

    if (!status) {
      return predictions;
    }

    return predictions.filter((entry) => entry.status === status);
  },
});

export const listByFixture = query({
  args: { fixtureId: v.number() },
  handler: async (ctx, { fixtureId }) => {
    return ctx.db
      .query("predictions")
      .withIndex("by_fixture", (q) => q.eq("fixtureId", fixtureId))
      .collect();
  },
});

export const getById = query({
  args: { predictionId: v.id("predictions") },
  handler: async (ctx, { predictionId }) => {
    return ctx.db.get(predictionId);
  },
});

export const markClaimed = mutation({
  args: {
    predictionId: v.id("predictions"),
    walletPubkey: v.string(),
    claimTxSig: v.string(),
    payoutAmount: v.number(),
    payoutBaseUnits: v.string(),
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.get(args.predictionId);
    if (!prediction) {
      throw new Error("Prediction not found");
    }

    if (
      normalizeWalletPubkey(prediction.walletPubkey) !==
      normalizeWalletPubkey(args.walletPubkey)
    ) {
      throw new Error("Wallet mismatch");
    }

    if (prediction.status !== "won") {
      throw new Error("Prediction is not eligible for claim");
    }

    const now = Date.now();
    await ctx.db.patch(args.predictionId, {
      status: "settled",
      claimTxSig: args.claimTxSig,
      payoutAmount: args.payoutAmount,
      payoutBaseUnits: args.payoutBaseUnits,
      updatedAt: now,
      resolvedAt: prediction.resolvedAt ?? now,
    });

    return args.predictionId;
  },
});

export const lockOpenPredictions = mutation({
  args: { fixtureId: v.number() },
  handler: async (ctx, { fixtureId }) => {
    const openPredictions = await ctx.db
      .query("predictions")
      .withIndex("by_fixture", (q) => q.eq("fixtureId", fixtureId))
      .collect();

    const now = Date.now();
    let locked = 0;

    for (const prediction of openPredictions) {
      if (prediction.status !== "open") continue;
      await ctx.db.patch(prediction._id, {
        status: "locked",
        updatedAt: now,
      });
      locked += 1;
    }

    return { locked };
  },
});

export const resolveFixture = mutation({
  args: {
    fixtureId: v.number(),
    winningSelection: v.string(),
  },
  handler: async (ctx, { fixtureId, winningSelection }) => {
    const fixturePredictions = await ctx.db
      .query("predictions")
      .withIndex("by_fixture", (q) => q.eq("fixtureId", fixtureId))
      .collect();

    const active = fixturePredictions.filter(
      (entry) => entry.status === "open" || entry.status === "locked",
    );

    const totalPool = active.reduce((sum, entry) => sum + entry.stakeAmount, 0);
    const winningPool = active
      .filter((entry) => entry.selection === winningSelection)
      .reduce((sum, entry) => sum + entry.stakeAmount, 0);

    const now = Date.now();
    let resolved = 0;

    for (const prediction of active) {
      const won = prediction.selection === winningSelection;
      let payoutAmount = 0;
      let payoutBaseUnits = "0";

      if (won && winningPool > 0) {
        payoutAmount = (prediction.stakeAmount / winningPool) * totalPool;
        const ratio = payoutAmount / prediction.stakeAmount;
        payoutBaseUnits = (
          (BigInt(prediction.stakeBaseUnits) * BigInt(Math.round(ratio * 1_000_000))) /
          BigInt(1_000_000)
        ).toString();
      }

      await ctx.db.patch(prediction._id, {
        status: won ? "won" : "lost",
        payoutAmount: won ? payoutAmount : 0,
        payoutBaseUnits: won ? payoutBaseUnits : "0",
        updatedAt: now,
        resolvedAt: now,
      });
      resolved += 1;
    }

    return { resolved, totalPool, winningPool };
  },
});
