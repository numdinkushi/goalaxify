import type { Doc } from "@goalaxify/convex/_generated/dataModel";
import type { PredictionStatus } from "@goalaxify/domain";

export type BetStatusMeta = {
  label: string;
  description: string;
  tone: "open" | "pending" | "won" | "lost" | "settled";
};

export function getBetStatusMeta(status: PredictionStatus): BetStatusMeta {
  switch (status) {
    case "open":
      return {
        label: "Open",
        description: "Waiting for kickoff",
        tone: "open",
      };
    case "locked":
      return {
        label: "In play",
        description: "Match started — awaiting result",
        tone: "pending",
      };
    case "won":
      return {
        label: "Won",
        description: "Claim your winnings",
        tone: "won",
      };
    case "lost":
      return {
        label: "Lost",
        description: "Better luck on the next one",
        tone: "lost",
      };
    case "settled":
      return {
        label: "Settled",
        description: "Winnings claimed on-chain",
        tone: "settled",
      };
    default:
      return {
        label: status,
        description: "",
        tone: "open",
      };
  }
}

export function resolveBetKickoff(
  prediction: Doc<"predictions">,
  fixture?: { kickoffAt?: string; round?: string; status?: string },
) {
  return {
    kickoffAt: prediction.kickoffAt ?? fixture?.kickoffAt,
    round: prediction.round ?? fixture?.round,
    matchStatus: fixture?.status,
  };
}

export function resolveBetPayout(prediction: Doc<"predictions">) {
  const stake = prediction.stakeAmount;
  const token = prediction.stakeToken;

  if (prediction.status === "won" || prediction.status === "settled") {
    const payout = prediction.payoutAmount ?? prediction.estimatedReturn ?? stake;
    const profit = Math.max(payout - stake, 0);
    return { stake, payout, profit, token, isFinal: true };
  }

  if (prediction.status === "lost") {
    return { stake, payout: 0, profit: -stake, token, isFinal: true };
  }

  const payout = prediction.estimatedReturn ?? stake;
  const profit = Math.max(payout - stake, 0);
  return { stake, payout, profit, token, isFinal: false };
}
