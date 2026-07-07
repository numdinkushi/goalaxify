import { NextResponse } from "next/server";

import { getDataProvider } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fixtureIdParam = searchParams.get("fixtureId");

  if (!fixtureIdParam) {
    return NextResponse.json(
      { ok: false, error: "fixtureId is required" },
      { status: 400 },
    );
  }

  const fixtureId = Number(fixtureIdParam);
  if (!Number.isFinite(fixtureId)) {
    return NextResponse.json(
      { ok: false, error: "fixtureId must be a number" },
      { status: 400 },
    );
  }

  try {
    const moments = await getDataProvider().getMoments(fixtureId);
    return NextResponse.json(
      { ok: true, moments },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load live moments";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
