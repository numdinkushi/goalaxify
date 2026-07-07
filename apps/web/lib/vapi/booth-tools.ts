/** Client-side Vapi tools for the Goalaxify voice booth. */

import { BoothSessionMode } from "@/lib/enums";

export const SUBMIT_PREDICTION_TOOL = "submitPrediction";
export const CANCEL_PREDICTION_TOOL = "cancelPrediction";

const SUBMIT_TOOL = {
  type: "function" as const,
  async: true,
  function: {
    name: SUBMIT_PREDICTION_TOOL,
    description:
      "Lock in the user's confirmed match prediction and stake. Call ONLY after the user clearly confirms their pick (home, draw, or away) and stake amount.",
    parameters: {
      type: "object",
      properties: {
        selection: {
          type: "string",
          enum: ["home", "draw", "away"],
          description: "Match outcome: home win, draw, or away win",
        },
        stake: {
          type: "number",
          description: "Stake amount as a positive number",
        },
        stakeToken: {
          type: "string",
          enum: ["SOL", "USDC"],
          description: "Token to stake. Default SOL if not specified.",
        },
      },
      required: ["selection", "stake"],
    },
  },
};

const CANCEL_TOOL = {
  type: "function" as const,
  async: true,
  function: {
    name: CANCEL_PREDICTION_TOOL,
    description:
      "Cancel the existing open bet and refund the full stake. Call ONLY after the user clearly confirms they want to cancel.",
    parameters: {
      type: "object",
      properties: {
        confirmed: {
          type: "boolean",
          description: "Must be true once the user confirms cancellation.",
        },
      },
      required: ["confirmed"],
    },
  },
};

export function getBoothAssistantTools(mode: BoothSessionMode = BoothSessionMode.Stake) {
  const submitTool =
    mode === BoothSessionMode.Manage
      ? {
          ...SUBMIT_TOOL,
          function: {
            ...SUBMIT_TOOL.function,
            description:
              "Replace the existing bet with a new confirmed pick and stake. Call ONLY after the user clearly confirms the replacement.",
          },
        }
      : SUBMIT_TOOL;

  const tools: Array<
    | { type: "endCall" }
    | typeof SUBMIT_TOOL
    | typeof CANCEL_TOOL
  > = [{ type: "endCall" }, submitTool];

  if (mode === BoothSessionMode.Manage) {
    tools.splice(1, 0, CANCEL_TOOL);
  }

  return tools;
}
