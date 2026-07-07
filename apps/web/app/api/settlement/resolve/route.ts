import { NextResponse } from "next/server";

import { api } from "@goalaxify/convex/_generated/api";
import { getConvexHttpClient } from "@/lib/convex/http-client";
import { deriveWinnerFromScore } from "@/lib/utils/prediction";

export async function POST(request: Request) {
  try {
    const secret = process.env.SETTLEMENT_CRON_SECRET;
    const provided = request.headers.get("x-settlement-secret");

    if (!secret || provided !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      fixtureId?: number;
      homeScore?: number;
      awayScore?: number;
      winningSelection?: string;
    };

    if (body.fixtureId === undefined) {
      return NextResponse.json(
        { ok: false, error: "fixtureId is required" },
        { status: 400 },
      );
    }

    const winningSelection =
      body.winningSelection ??
      (body.homeScore !== undefined && body.awayScore !== undefined
        ? deriveWinnerFromScore(body.homeScore, body.awayScore)
        : null);

    if (!winningSelection) {
      return NextResponse.json(
        { ok: false, error: "Provide winningSelection or final score" },
        { status: 400 },
      );
    }

    const convex = getConvexHttpClient();
    if (!convex) {
      return NextResponse.json(
        { ok: false, error: "Convex is not configured" },
        { status: 503 },
      );
    }

    const result = await convex.mutation(api.predictions.resolveFixture, {
      fixtureId: body.fixtureId,
      winningSelection,
    });

    return NextResponse.json({ ok: true, ...result, winningSelection });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to resolve fixture";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
