import type { BoothContext } from "@/lib/data/types";
import type { BoothSessionMode } from "@/lib/enums";
import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
} from "@/lib/i18n/language-constants";
import {
  buildBoothFirstMessageForLanguage,
  getBoothTranscriberConfig,
} from "@/lib/vapi/booth-language";
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
export const BOOTH_TRANSCRIBER = getBoothTranscriberConfig(DEFAULT_LANGUAGE);

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
  language?: LanguageCode;
}) {
  const language = input.language ?? DEFAULT_LANGUAGE;
  const promptOptions: BoothPromptOptions = {
    mode: input.mode,
    manageBet: input.manageBet,
    language,
  };

  return {
    firstMessage:
      buildBoothFirstMessageForLanguage(input.context, language, promptOptions) ||
      buildBoothFirstMessage(input.context, promptOptions),
    voice: BOOTH_VOICE,
    transcriber: getBoothTranscriberConfig(language),
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
      language,
      app: "goalaxify",
    },
    maxDurationSeconds: 180,
  };
}
