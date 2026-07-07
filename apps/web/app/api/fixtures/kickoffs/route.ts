import { NextResponse } from "next/server";

import { getDataProvider } from "@/lib/data";

export async function GET() {
  try {
    const matches = await getDataProvider().getUpcomingMatches();

    const kickoffs = matches.map((match) => ({
      fixtureId: match.fixtureId,
      kickoffAt: match.kickoffAt,
      round: match.round,
      status: match.status,
      homeTeam: match.home.name,
      awayTeam: match.away.name,
    }));

    return NextResponse.json({ ok: true, kickoffs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load fixture kickoffs";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
