import type { MatchOutcome, PredictionMarket, Team, ThreeWayOdds } from "@goalaxify/domain";

import type { MatchStatus, OddsSource } from "@/lib/enums";

export type FeaturedMatchView = {
  ref: string;
  fixtureId: number;
  home: Team;
  away: Team;
  venue: string;
  kickoffAt: string;
  status: MatchStatus;
  round: string;
  boothOpen: boolean;
  market: ThreeWayOdds;
  crowd: ThreeWayOdds | null;
  marketDeltaPct: number | null;
  oddsSource: OddsSource;
};

export type MomentView = {
  fixtureId: number;
  minute: number;
  homeScore: number;
  awayScore: number;
  eventType: "goal" | "halftime" | "fulltime";
  summary?: string;
  createdAt?: number;
};

export type ActionCardView = {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  variant: "default" | "secondary";
  disabled?: boolean;
};

export type BoothContext = {
  fixtureId: number;
  ref: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  round: string;
  kickoffAt?: string;
  market?: PredictionMarket;
  odds?: ThreeWayOdds;
};

export type SettlementBadgeView = {
  label: string;
  provider: string;
};

export const OUTCOME_LABELS: Record<MatchOutcome, string> = {
  home: "Home win",
  draw: "Draw",
  away: "Away win",
};

export const OUTCOME_SHORT_LABELS: Record<MatchOutcome, string> = {
  home: "Home",
  draw: "Draw",
  away: "Away",
};
