import type { MatchOutcome, PredictionDraft } from "@goalaxify/domain";

/** TxODDS stat keys for match-winner style markets (World Cup). */
const STAT_HOME_WIN = 1;
const STAT_DRAW = 2;
const STAT_AWAY_WIN = 3;

export interface MarketIntentPayload {
  fixture_id: number;
  period: number;
  stat_a_key: number;
  stat_b_key: number | null;
  predicate: "GreaterThan" | "LessThan" | "Equal";
  op: null;
  negation: boolean;
  selection: string;
  market: string;
}

function statKeyForSelection(selection: string): number {
  switch (selection as MatchOutcome) {
    case "home":
      return STAT_HOME_WIN;
    case "draw":
      return STAT_DRAW;
    case "away":
      return STAT_AWAY_WIN;
    default:
      return STAT_HOME_WIN;
  }
}

export function buildMarketIntentPayload(
  draft: PredictionDraft,
): MarketIntentPayload {
  return {
    fixture_id: draft.fixtureId,
    period: 0,
    stat_a_key: statKeyForSelection(draft.selection),
    stat_b_key: null,
    predicate: "GreaterThan",
    op: null,
    negation: false,
    selection: draft.selection,
    market: draft.market,
  };
}
