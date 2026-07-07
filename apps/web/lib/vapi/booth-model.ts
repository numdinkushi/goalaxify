import type { BoothContext } from "@/lib/data/types";
import { getVapiModelName, getVapiModelProvider } from "@/lib/vapi/config";
import { buildBoothSystemPrompt } from "@/lib/vapi/booth-prompt";
import { getBoothAssistantTools } from "@/lib/vapi/booth-tools";

/** Full model block for Vapi assistantOverrides (provider + model are required). */
export function buildBoothModelOverride(context: BoothContext) {
  return {
    provider: getVapiModelProvider(),
    model: getVapiModelName(),
    messages: [
      {
        role: "system" as const,
        content: buildBoothSystemPrompt(context),
      },
    ],
    tools: getBoothAssistantTools(),
  };
}
