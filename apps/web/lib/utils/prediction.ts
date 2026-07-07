import type { MatchOutcome, PredictionDraft, StakeToken } from "@goalaxify/domain";
import type { ThreeWayOdds } from "@goalaxify/domain";

import type { BoothContext } from "@/lib/data/types";
import { getOutcomeValue } from "@/lib/utils/odds";

const OUTCOME_VALUES: MatchOutcome[] = ["home", "draw", "away"];

export type PotentialPayout = {
  stake: number;
  payout: number;
  profit: number;
  multiplier: number;
  stakeToken: StakeToken;
};

export function normalizeSelection(value: string): MatchOutcome | null {
  const normalized = value.trim().toLowerCase();

  if (OUTCOME_VALUES.includes(normalized as MatchOutcome)) {
    return normalized as MatchOutcome;
  }

  if (normalized.includes("home")) return "home";
  if (normalized.includes("draw") || normalized.includes("tie")) return "draw";
  if (normalized.includes("away")) return "away";

  return null;
}

export function deriveWinnerFromScore(
  homeScore: number,
  awayScore: number,
): MatchOutcome {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

export function estimateReturnFromOdds(
  selection: MatchOutcome,
  stake: number,
  odds?: ThreeWayOdds,
): number | undefined {
  const summary = calculatePotentialPayout(selection, stake, odds);
  return summary?.payout;
}

export function calculatePotentialPayout(
  selection: MatchOutcome,
  stake: number,
  odds?: ThreeWayOdds,
  stakeToken: StakeToken = "SOL",
): PotentialPayout | null {
  if (!odds || stake <= 0) return null;

  const { returnMultiplier } = getOutcomeValue(odds, selection);
  if (!returnMultiplier || returnMultiplier <= 0) return null;

  const payout = stake * returnMultiplier;
  const profit = Math.max(payout - stake, 0);

  return {
    stake,
    payout,
    profit,
    multiplier: returnMultiplier,
    stakeToken,
  };
}

export function formatTokenAmount(value: number, maxDecimals = 4): string {
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(3);
  return value.toFixed(maxDecimals);
}

export function buildDraftFromContext(input: {
  context: BoothContext;
  selection?: string;
  stake?: number;
  stakeToken?: StakeToken;
  vapiCallId?: string;
}): PredictionDraft {
  const selection = normalizeSelection(input.selection ?? "home") ?? "home";
  const stake = input.stake ?? 0.1;
  const stakeToken = input.stakeToken ?? "SOL";

  return {
    fixtureId: input.context.fixtureId,
    market: input.context.market ?? "match_winner",
    selection,
    stake,
    stakeToken,
    homeTeam: input.context.homeTeam,
    awayTeam: input.context.awayTeam,
    kickoffAt: input.context.kickoffAt,
    round: input.context.round,
    vapiCallId: input.vapiCallId,
    estimatedReturn: estimateReturnFromOdds(
      selection,
      stake,
      input.context.odds,
    ),
  };
}

export function parseVapiStructuredOutput(
  payload: unknown,
  context: BoothContext,
): PredictionDraft | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const selectionRaw =
    (record.selection as string | undefined) ??
    (record.pick as string | undefined) ??
    (record.outcome as string | undefined);

  const stakeRaw = record.stake ?? record.amount ?? record.stakeAmount;
  const stakeTokenRaw = record.stakeToken ?? record.token;

  const stake =
    typeof stakeRaw === "number"
      ? stakeRaw
      : typeof stakeRaw === "string"
        ? Number.parseFloat(stakeRaw)
        : undefined;

  const stakeToken =
    stakeTokenRaw === "USDC" || stakeTokenRaw === "SOL"
      ? stakeTokenRaw
      : undefined;

  if (!selectionRaw && stake === undefined) {
    return null;
  }

  return buildDraftFromContext({
    context,
    selection: selectionRaw,
    stake,
    stakeToken,
    vapiCallId:
      typeof record.callId === "string" ? record.callId : undefined,
  });
}
