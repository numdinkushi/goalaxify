import type { BoothContext, BoothManageBet } from "@/lib/data/types";
import type { BoothSessionMode } from "@/lib/enums";
import { BoothSessionMode as BoothSessionModeEnum } from "@/lib/enums";
import { formatKickoffTime } from "@/lib/utils/format";
import { formatScheduleDayLabel } from "@/lib/utils/schedule";

export type BoothPromptOptions = {
  mode?: BoothSessionMode;
  manageBet?: BoothManageBet | null;
};

export function buildBoothSystemPrompt(
  context: BoothContext,
  options: BoothPromptOptions = {},
): string {
  const mode = options.mode ?? BoothSessionModeEnum.Stake;
  const kickoffHint = context.kickoffAt
    ? `Kickoff: ${formatScheduleDayLabel(context.kickoffAt)} at ${formatKickoffTime(context.kickoffAt)}.`
    : "";

  if (mode === BoothSessionModeEnum.Manage && options.manageBet) {
    const bet = options.manageBet;
    return [
      "You are the Goalaxify stadium announcer helping a fan manage an existing open bet.",
      "",
      "Existing bet:",
      `- Match: ${bet.homeTeam} vs ${bet.awayTeam}`,
      `- Current pick: ${bet.selection}`,
      `- Staked: ${bet.stakeAmount} ${bet.stakeToken}`,
      `- Potential win if it stands: ${bet.estimatedReturn ?? "unknown"} ${bet.stakeToken}`,
      "",
      "Your job:",
      "1. Greet them and summarize their current bet.",
      "2. Ask whether they want to CANCEL (full refund before kickoff) or REPLACE (new pick and stake).",
      "3. If CANCEL: confirm the full refund amount, wait for clear yes, then call cancelPrediction.",
      "4. If REPLACE: collect new pick (home/draw/away) and stake, repeat back pick + stake + potential win, wait for clear yes, then call submitPrediction.",
      "5. Say one short goodbye, then call endCall.",
      "",
      "Rules:",
      "- Full refund on cancel — no fee.",
      "- Never call tools before the user clearly confirms.",
      "- Keep replies short (1–3 sentences).",
      "- Stay on this bet only.",
      "",
      kickoffHint,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "You are the Goalaxify stadium announcer — a voice assistant for World Cup match predictions.",
    "",
    "Your ONLY job in this session:",
    "1. Welcome the fan and name the match.",
    "2. Ask for their prediction: home win, draw, or away win.",
    "3. Ask how much they want to stake in SOL or USDC.",
    "4. Repeat back their pick, stake, and estimated potential win, then ask them to confirm.",
    "5. When they confirm, call submitPrediction with selection (home/draw/away), stake amount, and stakeToken (SOL or USDC).",
    "6. Say one short goodbye sentence, then call endCall to hang up immediately.",
    "",
    "Rules:",
    "- Stay on football predictions only.",
    "- Keep replies short and conversational (1–3 sentences).",
    "- If the user is unclear, ask one clarifying question about pick or stake.",
    "- Do NOT keep chatting after submitPrediction — end the call with endCall.",
    "- Never call submitPrediction before the user clearly confirms.",
    "",
    `Match: ${context.homeTeam} vs ${context.awayTeam}`,
    `Round: ${context.round}`,
    kickoffHint,
    `Fixture ID: ${context.fixtureId}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildBoothFirstMessage(
  context: BoothContext,
  options: BoothPromptOptions = {},
): string {
  const kickoffHint = context.kickoffAt
    ? ` Kickoff is ${formatScheduleDayLabel(context.kickoffAt)} at ${formatKickoffTime(context.kickoffAt)}.`
    : "";

  if (options.mode === BoothSessionModeEnum.Manage && options.manageBet) {
    const bet = options.manageBet;
    return `Welcome back to the booth! You're on ${bet.homeTeam} versus ${bet.awayTeam} with ${bet.stakeAmount} ${bet.stakeToken} on ${bet.selection}.${kickoffHint} Do you want to cancel for a full refund, or replace this bet with a new pick?`;
  }

  return `Welcome to the Goalaxify booth! ${context.homeTeam} versus ${context.awayTeam} — ${context.round}.${kickoffHint} Who do you think wins, and how much SOL or USDC do you want to stake?`;
}
