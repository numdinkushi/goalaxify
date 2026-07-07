import type {
  ActionCardView,
  BoothContext,
  FeaturedMatchView,
  MomentView,
  SettlementBadgeView,
} from "@/lib/data/types";

export interface IDataProvider {
  getFeaturedMatch(): Promise<FeaturedMatchView | null>;
  getUpcomingMatches(): Promise<FeaturedMatchView[]>;
  getActionCards(): Promise<ActionCardView[]>;
  getMoments(fixtureId?: number): Promise<MomentView[]>;
  getBoothContext(fixtureId?: number): Promise<BoothContext>;
  getSettlementBadge(): Promise<SettlementBadgeView>;
  listFixtures(): Promise<FeaturedMatchView[]>;
}
