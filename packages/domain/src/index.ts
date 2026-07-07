export type LanguageCode =
  | "en"
  | "es"
  | "fr"
  | "pt"
  | "de"
  | "it"
  | "zh"
  | "ja"
  | "ko"
  | "ar";

export type PredictionStatus = "open" | "locked" | "won" | "lost" | "settled";

export type PredictionMarket = "match_winner" | "over_under" | "both_teams_score";

export type StakeToken = "SOL" | "USDC";

export type MatchOutcome = "home" | "draw" | "away";

export type StakeMethod = "txoracle_intent" | "native_pool";

export interface Team {
  name: string;
  code: string;
  flag: string;
}

export interface ThreeWayOdds {
  homePct: number;
  drawPct: number;
  awayPct: number;
  homeReturn?: number;
  drawReturn?: number;
  awayReturn?: number;
}

export interface MatchSummary {
  fixtureId: number;
  ref?: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt?: string;
  status?: string;
}

export interface PredictionDraft {
  fixtureId: number;
  market: PredictionMarket;
  selection: string;
  stake: number;
  stakeToken?: StakeToken;
  homeTeam?: string;
  awayTeam?: string;
  kickoffAt?: string;
  round?: string;
  vapiCallId?: string;
  estimatedReturn?: number;
}

export interface StoredPrediction extends PredictionDraft {
  id: string;
  walletPubkey: string;
  stakeToken: StakeToken;
  stakeBaseUnits: string;
  status: PredictionStatus;
  stakeMethod: StakeMethod;
  intentId?: string;
  intentTxSig?: string;
  claimTxSig?: string;
  termsHash?: string;
  payoutAmount?: number;
  payoutBaseUnits?: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
}

export interface MomentEvent {
  fixtureId: number;
  minute: number;
  homeScore: number;
  awayScore: number;
  eventType: "goal" | "halftime" | "fulltime";
  summary?: string;
}
