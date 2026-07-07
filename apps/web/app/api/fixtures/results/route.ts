import { NextResponse } from "next/server";

import { fetchFixtureResult } from "@/lib/data/txline/fetch-fixture-result";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fixtureIds?: number[];
    };

    const fixtureIds = body.fixtureIds?.filter(
      (id) => typeof id === "number" && Number.isFinite(id),
    );

    if (!fixtureIds || fixtureIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "fixtureIds is required" },
        { status: 400 },
      );
    }

    const uniqueIds = [...new Set(fixtureIds)];
    const results = await Promise.all(
      uniqueIds.map((fixtureId) => fetchFixtureResult(fixtureId)),
    );

    return NextResponse.json(
      {
        ok: true,
        results: results.filter((entry) => entry !== null),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load fixture results";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
