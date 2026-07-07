import type { BoothContext } from "@/lib/data/types";
import type { BoothSessionMode } from "@/lib/enums";
import { BoothSessionMode as BoothSessionModeEnum } from "@/lib/enums";
import { getVapiModelName, getVapiModelProvider } from "@/lib/vapi/config";
import {
  buildBoothSystemPrompt,
  type BoothPromptOptions,
} from "@/lib/vapi/booth-prompt";
import { getBoothAssistantTools } from "@/lib/vapi/booth-tools";

/** Model override for per-match prompt + client-side tools. Provider/model required by Vapi API. */
export function buildBoothModelOverride(
  context: BoothContext,
  options: BoothPromptOptions & { mode?: BoothSessionMode } = {},
) {
  const mode = options.mode ?? BoothSessionModeEnum.Stake;

  return {
    provider: getVapiModelProvider(),
    model: getVapiModelName(),
    messages: [
      {
        role: "system" as const,
        content: buildBoothSystemPrompt(context, options),
      },
    ],
    tools: getBoothAssistantTools(mode),
  };
}
