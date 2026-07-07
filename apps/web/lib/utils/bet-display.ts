import type { Doc } from "@goalaxify/convex/_generated/dataModel";
import type { MatchOutcome, PredictionStatus } from "@goalaxify/domain";

import { MAX_BET_MANAGE_COUNT } from "@/lib/constants/predictions";
import { OUTCOME_LABELS } from "@/lib/data/types";
import { MatchStatus } from "@/lib/enums";
import { formatKickoffTime } from "@/lib/utils/format";
import { formatScheduleDayLabel } from "@/lib/utils/schedule";

export type BetStatusMeta = {
  label: string;
  description: string;
  tone:
    | "open"
    | "pending"
    | "won"
    | "lost"
    | "settled"
    | "cancelled"
    | "replaced";
};

export function getBetStatusMeta(status: PredictionStatus): BetStatusMeta {
  switch (status) {
    case "open":
      return {
        label: "Open",
        description: "Tap to manage by voice before kickoff",
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
    case "cancelled":
      return {
        label: "Cancelled",
        description: "Full stake refunded before kickoff",
        tone: "cancelled",
      };
    case "replaced":
      return {
        label: "Replaced",
        description: "Superseded by a newer bet on this match",
        tone: "replaced",
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

export function isMatchStarted(
  prediction: Pick<Doc<"predictions">, "status">,
  kickoffAt?: string,
  matchStatus?: string,
): boolean {
  if (prediction.status === "locked") return true;

  const normalized = matchStatus?.toLowerCase();
  if (
    normalized === "live" ||
    normalized === "halftime" ||
    normalized === "finished"
  ) {
    return true;
  }

  if (!kickoffAt) return false;
  const kickoffMs = Date.parse(kickoffAt);
  if (!Number.isFinite(kickoffMs)) return false;
  return kickoffMs <= Date.now();
}

export function canManageBet(
  prediction: Pick<Doc<"predictions">, "status" | "manageCount">,
  kickoffAt?: string,
  matchStatus?: string,
): boolean {
  if (prediction.status !== "open") return false;
  if ((prediction.manageCount ?? 0) >= MAX_BET_MANAGE_COUNT) return false;
  return !isMatchStarted(prediction, kickoffAt, matchStatus);
}

export function formatBetKickoff(kickoffAt?: string): {
  primary: string;
  secondary: string;
} {
  if (!kickoffAt) {
    return {
      primary: "Schedule pending",
      secondary: "Kickoff time not available yet",
    };
  }

  const kickoffMs = Date.parse(kickoffAt);
  if (!Number.isFinite(kickoffMs)) {
    return {
      primary: "Schedule pending",
      secondary: "Kickoff time not available yet",
    };
  }

  return {
    primary: `${formatScheduleDayLabel(kickoffAt)} · ${formatKickoffTime(kickoffAt)}`,
    secondary: new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(kickoffMs)),
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

  if (prediction.status === "cancelled" || prediction.status === "replaced") {
    return { stake, payout: stake, profit: 0, token, isFinal: true };
  }

  const payout = prediction.estimatedReturn ?? stake;
  const profit = Math.max(payout - stake, 0);
  return { stake, payout, profit, token, isFinal: false };
}

export function formatFinalScore(
  homeScore?: number,
  awayScore?: number,
): string | null {
  if (homeScore === undefined || awayScore === undefined) {
    return null;
  }

  return `${homeScore}–${awayScore}`;
}

export function resolveBetVerdict(
  prediction: Pick<Doc<"predictions">, "selection" | "status" | "homeTeam" | "awayTeam">,
  winningSelection?: string,
): {
  isCorrect: boolean | null;
  winningLabel: string | null;
} {
  if (
    prediction.status === "won" ||
    prediction.status === "settled"
  ) {
    return {
      isCorrect: true,
      winningLabel:
        OUTCOME_LABELS[prediction.selection as MatchOutcome] ??
        prediction.selection,
    };
  }

  if (prediction.status === "lost") {
    const winningLabel = winningSelection
      ? OUTCOME_LABELS[winningSelection as MatchOutcome] ?? winningSelection
      : null;
    return { isCorrect: false, winningLabel };
  }

  if (!winningSelection) {
    return { isCorrect: null, winningLabel: null };
  }

  const isCorrect = prediction.selection === winningSelection;
  return {
    isCorrect,
    winningLabel:
      OUTCOME_LABELS[winningSelection as MatchOutcome] ?? winningSelection,
  };
}

export function isMatchFinishedForBet(
  prediction: Pick<Doc<"predictions">, "status">,
  matchStatus?: string,
): boolean {
  if (
    prediction.status === "won" ||
    prediction.status === "lost" ||
    prediction.status === "settled"
  ) {
    return true;
  }

  return matchStatus?.toLowerCase() === MatchStatus.Finished;
}
