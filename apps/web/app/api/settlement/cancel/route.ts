import { Connection } from "@solana/web3.js";
import {
  PoolEscrowClient,
  fromBaseUnits,
} from "@goalaxify/solana-settlement";
import { NextResponse } from "next/server";

import { api } from "@goalaxify/convex/_generated/api";
import type { Id } from "@goalaxify/convex/_generated/dataModel";
import { getConvexHttpClient } from "@/lib/convex/http-client";
import { loadPoolAuthorityKeypair } from "@/lib/settlement/authority";
import {
  getRequestSettlementConfig,
  getRequestSettlementNetwork,
  getRequestSolanaRpcEndpoint,
} from "@/lib/solana/request-config";

function isKickoffInFuture(kickoffAt?: string): boolean {
  if (!kickoffAt) return true;
  const kickoffMs = Date.parse(kickoffAt);
  if (!Number.isFinite(kickoffMs)) return true;
  return kickoffMs > Date.now();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      predictionId?: Id<"predictions">;
      walletPubkey?: string;
      reason?: "cancel" | "replace";
    };

    if (!body.predictionId || !body.walletPubkey) {
      return NextResponse.json(
        { ok: false, error: "predictionId and walletPubkey are required" },
        { status: 400 },
      );
    }

    const convex = getConvexHttpClient();
    const network = await getRequestSettlementNetwork();
    const authority = loadPoolAuthorityKeypair(network);

    if (!convex) {
      return NextResponse.json(
        { ok: false, error: "Convex is not configured" },
        { status: 503 },
      );
    }

    if (!authority) {
      return NextResponse.json(
        { ok: false, error: "Settlement pool authority is not configured" },
        { status: 503 },
      );
    }

    const prediction = await convex.query(api.predictions.getById, {
      predictionId: body.predictionId,
    });

    if (!prediction) {
      return NextResponse.json(
        { ok: false, error: "Prediction not found" },
        { status: 404 },
      );
    }

    if (prediction.walletPubkey !== body.walletPubkey.trim()) {
      return NextResponse.json(
        { ok: false, error: "Wallet mismatch" },
        { status: 403 },
      );
    }

    const manageCount = prediction.manageCount ?? 0;
    if (manageCount >= 1) {
      return NextResponse.json(
        { ok: false, error: "This bet has already been changed once" },
        { status: 400 },
      );
    }

    if (prediction.status !== "open") {
      return NextResponse.json(
        { ok: false, error: "Only open bets can be cancelled before kickoff" },
        { status: 400 },
      );
    }

    if (!isKickoffInFuture(prediction.kickoffAt)) {
      return NextResponse.json(
        { ok: false, error: "This match has already started — cancellation is closed" },
        { status: 400 },
      );
    }

    const refundBaseUnits = BigInt(prediction.stakeBaseUnits);
    if (refundBaseUnits <= BigInt(0)) {
      return NextResponse.json(
        { ok: false, error: "Invalid stake amount" },
        { status: 400 },
      );
    }

    const config = await getRequestSettlementConfig();
    const connection = new Connection(await getRequestSolanaRpcEndpoint(), "confirmed");
    const poolClient = new PoolEscrowClient(connection, network);

    const { PublicKey } = await import("@solana/web3.js");
    const recipient = new PublicKey(body.walletPubkey);

    const refund = await poolClient.payoutFromAuthority(authority, {
      recipient,
      amountBaseUnits: refundBaseUnits,
      stakeToken: prediction.stakeToken,
      memo: `goalaxify:cancel:${prediction.fixtureId}`,
    });

    const refundAmount = fromBaseUnits(
      refund.paidBaseUnits,
      prediction.stakeToken,
      config,
    );

    await convex.mutation(api.predictions.markCancelled, {
      predictionId: body.predictionId,
      walletPubkey: body.walletPubkey,
      refundTxSig: refund.txSig,
      reason: body.reason ?? "cancel",
    });

    return NextResponse.json({
      ok: true,
      txSig: refund.txSig,
      refundAmount,
      refundToken: prediction.stakeToken,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel prediction";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
