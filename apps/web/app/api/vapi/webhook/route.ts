import { NextResponse } from "next/server";

import { parseVapiStructuredOutput } from "@/lib/utils/prediction";
import type { BoothContext } from "@/lib/data/types";

function extractStructuredPayload(body: Record<string, unknown>): unknown {
  const message = body.message as Record<string, unknown> | undefined;
  if (!message) return null;

  return (
    message.analysis ??
    message.artifact ??
    message.toolCalls ??
    message.structuredData ??
    message
  );
}

export async function POST(request: Request) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  const provided = request.headers.get("x-vapi-secret");

  if (secret && provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const message = body.message as Record<string, unknown> | undefined;
    const type = message?.type;

    if (type !== "end-of-call-report" && type !== "status-update") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const metadata = (message?.call as Record<string, unknown> | undefined)
      ?.metadata as Record<string, unknown> | undefined;

    const structured = extractStructuredPayload(body);
    const context: BoothContext | null = metadata
      ? {
          fixtureId: Number(metadata.fixtureId),
          ref: String(metadata.ref ?? metadata.fixtureId ?? ""),
          homeTeam: String(metadata.homeTeam ?? ""),
          awayTeam: String(metadata.awayTeam ?? ""),
          homeFlag: "🏳️",
          awayFlag: "🏳️",
          round: String(metadata.round ?? ""),
          kickoffAt:
            typeof metadata.kickoffAt === "string"
              ? metadata.kickoffAt
              : undefined,
          market: "match_winner",
        }
      : null;

    const draft =
      context && structured
        ? parseVapiStructuredOutput(structured, context)
        : null;

    return NextResponse.json({
      ok: true,
      callId: (message?.call as Record<string, unknown> | undefined)?.id,
      walletPubkey: metadata?.walletPubkey,
      draft,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process webhook";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
