import type { BoothContext } from "@/lib/data/types";
import type { BoothSessionMode } from "@/lib/enums";
import { buildBoothModelOverride } from "@/lib/vapi/booth-model";
import {
  buildBoothFirstMessage,
  type BoothPromptOptions,
} from "@/lib/vapi/booth-prompt";

/** Match the Goalaxify / IQlify assistant voice in the Vapi dashboard. */
export const BOOTH_VOICE = {
  provider: "vapi" as const,
  version: 2,
  voiceId: "Elliot",
};

/** Match the assistant transcriber in the Vapi dashboard. */
export const BOOTH_TRANSCRIBER = {
  provider: "deepgram" as const,
  model: "flux-general-en",
  language: "en",
};

/**
 * Required for client-side tools. Vapi docs: subscribe to tool-calls when using
 * model.tools without a server URL.
 */
export const BOOTH_CLIENT_MESSAGES = [
  "tool-calls",
  "tool-calls-result",
  "transcript",
  "status-update",
  "speech-update",
] as const;

export function buildBoothAssistantOverrides(input: {
  context: BoothContext;
  mode: BoothSessionMode;
  manageBet?: BoothPromptOptions["manageBet"];
  walletPubkey?: string | null;
  managePredictionId?: string;
}) {
  const promptOptions: BoothPromptOptions = {
    mode: input.mode,
    manageBet: input.manageBet,
  };

  return {
    firstMessage: buildBoothFirstMessage(input.context, promptOptions),
    voice: BOOTH_VOICE,
    transcriber: BOOTH_TRANSCRIBER,
    clientMessages: [...BOOTH_CLIENT_MESSAGES],
    model: buildBoothModelOverride(input.context, promptOptions),
    metadata: {
      fixtureId: input.context.fixtureId,
      homeTeam: input.context.homeTeam,
      awayTeam: input.context.awayTeam,
      round: input.context.round,
      kickoffAt: input.context.kickoffAt,
      market: input.context.market,
      walletPubkey: input.walletPubkey ?? undefined,
      mode: input.mode,
      managePredictionId: input.managePredictionId,
      app: "goalaxify",
    },
    maxDurationSeconds: 180,
  };
}
