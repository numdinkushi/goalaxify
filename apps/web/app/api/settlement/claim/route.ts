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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      predictionId?: Id<"predictions">;
      walletPubkey?: string;
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

    if (prediction.status !== "won") {
      return NextResponse.json(
        { ok: false, error: "Prediction is not eligible for claim" },
        { status: 400 },
      );
    }

    const payoutBaseUnits = BigInt(prediction.payoutBaseUnits ?? "0");
    if (payoutBaseUnits <= BigInt(0)) {
      return NextResponse.json(
        { ok: false, error: "No payout available" },
        { status: 400 },
      );
    }

    const config = await getRequestSettlementConfig();
    const connection = new Connection(await getRequestSolanaRpcEndpoint(), "confirmed");
    const poolClient = new PoolEscrowClient(connection, network);

    const { PublicKey } = await import("@solana/web3.js");
    const recipient = new PublicKey(body.walletPubkey);

    const payout = await poolClient.payoutFromAuthority(authority, {
      recipient,
      amountBaseUnits: payoutBaseUnits,
      stakeToken: prediction.stakeToken,
      memo: `goalaxify:${prediction.fixtureId}`,
    });

    const payoutAmount =
      prediction.payoutAmount ??
      fromBaseUnits(payoutBaseUnits, prediction.stakeToken, config);

    await convex.mutation(api.predictions.markClaimed, {
      predictionId: body.predictionId,
      walletPubkey: body.walletPubkey,
      claimTxSig: payout.txSig,
      payoutAmount,
      payoutBaseUnits: payout.paidBaseUnits.toString(),
    });

    return NextResponse.json({ ok: true, txSig: payout.txSig });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process claim";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
