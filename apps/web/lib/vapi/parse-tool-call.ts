import type { PredictionDraft } from "@goalaxify/domain";

import type { BoothContext } from "@/lib/data/types";
import { VoiceActionType } from "@/lib/enums";
import { buildDraftFromContext } from "@/lib/utils/prediction";
import {
  CANCEL_PREDICTION_TOOL,
  SUBMIT_PREDICTION_TOOL,
} from "@/lib/vapi/booth-tools";

type ToolCallEntry = {
  name?: string;
  function?: { name?: string; arguments?: string | Record<string, unknown> };
  parameters?: Record<string, unknown>;
};

export type BoothToolAction =
  | { type: VoiceActionType.Stake; draft: PredictionDraft }
  | { type: VoiceActionType.Replace; draft: PredictionDraft }
  | { type: VoiceActionType.Cancel };

function parseToolArguments(
  args: string | Record<string, unknown> | undefined,
): Record<string, unknown> | null {
  if (!args) return null;
  if (typeof args === "object") return args;

  try {
    return JSON.parse(args) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toolCallName(entry: ToolCallEntry): string | null {
  return entry.name ?? entry.function?.name ?? null;
}

function toolCallParameters(entry: ToolCallEntry): Record<string, unknown> | null {
  if (entry.parameters) return entry.parameters;

  const nested = entry as ToolCallEntry & {
    toolCall?: {
      parameters?: Record<string, unknown>;
      function?: { arguments?: string | Record<string, unknown> };
    };
  };

  if (nested.toolCall?.parameters) {
    return nested.toolCall.parameters;
  }

  const toolCallArgs = nested.toolCall?.function?.arguments;
  if (typeof toolCallArgs === "object" && toolCallArgs !== null) {
    return toolCallArgs as Record<string, unknown>;
  }
  if (typeof toolCallArgs === "string") {
    return parseToolArguments(toolCallArgs);
  }

  return parseToolArguments(entry.function?.arguments);
}

function buildSubmitDraft(
  params: Record<string, unknown>,
  context: BoothContext,
  callId?: string | null,
): PredictionDraft | null {
  const selection =
    typeof params.selection === "string" ? params.selection : undefined;
  const stakeRaw = params.stake;
  const stake =
    typeof stakeRaw === "number"
      ? stakeRaw
      : typeof stakeRaw === "string"
        ? Number.parseFloat(stakeRaw)
        : undefined;

  if (!selection || stake === undefined || Number.isNaN(stake) || stake <= 0) {
    return null;
  }

  const stakeTokenRaw = params.stakeToken;
  const stakeToken =
    stakeTokenRaw === "USDC" || stakeTokenRaw === "SOL"
      ? stakeTokenRaw
      : undefined;

  return buildDraftFromContext({
    context,
    selection,
    stake,
    stakeToken,
    vapiCallId: callId ?? undefined,
  });
}

export function extractBoothToolAction(
  message: unknown,
  context: BoothContext,
  callId?: string | null,
  isManageMode = false,
): BoothToolAction | null {
  if (!message || typeof message !== "object") return null;

  const record = message as Record<string, unknown>;
  if (record.type !== "tool-calls") return null;

  const lists = [record.toolCallList, record.toolWithToolCallList].filter(
    Array.isArray,
  ) as ToolCallEntry[][];

  for (const list of lists) {
    for (const entry of list) {
      const nested = entry as ToolCallEntry & {
        toolCall?: { parameters?: Record<string, unknown> };
      };

      const name = toolCallName(nested);
      if (!name) continue;

      if (name === CANCEL_PREDICTION_TOOL) {
        return { type: VoiceActionType.Cancel };
      }

      if (name !== SUBMIT_PREDICTION_TOOL) continue;

      const params =
        nested.toolCall?.parameters ?? toolCallParameters(nested) ?? null;
      if (!params) continue;

      const draft = buildSubmitDraft(params, context, callId);
      if (!draft) continue;

      return {
        type: isManageMode ? VoiceActionType.Replace : VoiceActionType.Stake,
        draft,
      };
    }
  }

  return null;
}

/** @deprecated Use extractBoothToolAction */
export function extractSubmitPredictionDraft(
  message: unknown,
  context: BoothContext,
  callId?: string | null,
): PredictionDraft | null {
  const action = extractBoothToolAction(message, context, callId, false);
  if (!action || action.type === VoiceActionType.Cancel) return null;
  return action.draft;
}
