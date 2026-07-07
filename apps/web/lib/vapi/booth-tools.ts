/** Client-side Vapi tools for the Goalaxify voice booth. */

export const SUBMIT_PREDICTION_TOOL = "submitPrediction";

export function getBoothAssistantTools() {
  return [
    { type: "endCall" as const },
    {
      type: "function" as const,
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
    },
  ];
}

export const BOOTH_CLIENT_MESSAGES = [
  "tool-calls",
  "tool-calls-result",
  "transcript",
] as const;
