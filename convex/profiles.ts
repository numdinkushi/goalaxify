import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

function normalizeWalletPubkey(walletPubkey: string): string {
  return walletPubkey.trim();
}

async function getProfileByWallet(
  ctx: QueryCtx | MutationCtx,
  walletPubkey: string,
) {
  return ctx.db
    .query("profiles")
    .withIndex("by_wallet", (q) =>
      q.eq("walletPubkey", normalizeWalletPubkey(walletPubkey)),
    )
    .first();
}

async function resolveAvatarUrl(
  ctx: QueryCtx,
  profile: {
    avatarUrl?: string;
    avatarStorageId?: Id<"_storage">;
  },
) {
  if (profile.avatarUrl) {
    return profile.avatarUrl;
  }

  if (profile.avatarStorageId) {
    return await ctx.storage.getUrl(profile.avatarStorageId);
  }

  return null;
}

export const getByWallet = query({
  args: { walletPubkey: v.string() },
  handler: async (ctx, { walletPubkey }) => {
    return getProfileByWallet(ctx, walletPubkey);
  },
});

export const getProfileView = query({
  args: { walletPubkey: v.string() },
  handler: async (ctx, { walletPubkey }) => {
    const profile = await getProfileByWallet(ctx, walletPubkey);
    if (!profile) {
      return null;
    }

    const avatarUrl = await resolveAvatarUrl(ctx, profile);

    return {
      ...profile,
      avatarUrl,
    };
  },
});

export const upsert = mutation({
  args: {
    walletPubkey: v.string(),
    displayName: v.optional(v.string()),
    walletName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const walletPubkey = normalizeWalletPubkey(args.walletPubkey);
    const now = Date.now();

    const existing = await getProfileByWallet(ctx, walletPubkey);

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName ?? existing.displayName,
        walletName: args.walletName ?? existing.walletName,
        lastConnectedAt: now,
        updatedAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert("profiles", {
      walletPubkey,
      displayName: args.displayName,
      walletName: args.walletName,
      lastConnectedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProfile = mutation({
  args: {
    walletPubkey: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const walletPubkey = normalizeWalletPubkey(args.walletPubkey);
    const now = Date.now();
    const existing = await getProfileByWallet(ctx, walletPubkey);

    if (!existing) {
      return ctx.db.insert("profiles", {
        walletPubkey,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
        avatarStorageId: args.avatarStorageId,
        lastConnectedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.patch(existing._id, {
      ...(args.displayName !== undefined ? { displayName: args.displayName } : {}),
      ...(args.avatarUrl !== undefined ? { avatarUrl: args.avatarUrl } : {}),
      ...(args.avatarStorageId !== undefined
        ? { avatarStorageId: args.avatarStorageId }
        : {}),
      updatedAt: now,
    });

    return existing._id;
  },
});

export const touchConnection = mutation({
  args: {
    walletPubkey: v.string(),
    walletName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const walletPubkey = normalizeWalletPubkey(args.walletPubkey);
    const now = Date.now();

    const existing = await getProfileByWallet(ctx, walletPubkey);

    if (existing) {
      await ctx.db.patch(existing._id, {
        walletName: args.walletName ?? existing.walletName,
        lastConnectedAt: now,
        updatedAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert("profiles", {
      walletPubkey,
      walletName: args.walletName,
      lastConnectedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});
