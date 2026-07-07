import { NextResponse } from "next/server";

import { api } from "@goalaxify/convex/_generated/api";
import { fetchFixtureResult } from "@/lib/data/txline/fetch-fixture-result";
import { getConvexHttpClient } from "@/lib/convex/http-client";
import { MatchStatus } from "@/lib/enums";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fixtureId?: number;
    };

    if (body.fixtureId === undefined || !Number.isFinite(body.fixtureId)) {
      return NextResponse.json(
        { ok: false, error: "fixtureId is required" },
        { status: 400 },
      );
    }

    const result = await fetchFixtureResult(body.fixtureId);
    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Could not load match result" },
        { status: 404 },
      );
    }

    if (result.status !== MatchStatus.Finished || !result.winningSelection) {
      return NextResponse.json({
        ok: true,
        synced: false,
        reason: "match_not_finished",
        result,
      });
    }

    const convex = getConvexHttpClient();
    if (!convex) {
      return NextResponse.json(
        { ok: false, error: "Convex is not configured" },
        { status: 503 },
      );
    }

    const settlement = await convex.mutation(api.predictions.resolveFixture, {
      fixtureId: body.fixtureId,
      winningSelection: result.winningSelection,
    });

    return NextResponse.json({
      ok: true,
      synced: true,
      winningSelection: result.winningSelection,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      ...settlement,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync settlement";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
