import type {
  ActionCardView,
  BoothContext,
  FeaturedMatchView,
  MomentView,
  SettlementBadgeView,
} from "@/lib/data/types";

export interface IDataProvider {
  getFeaturedMatch(): Promise<FeaturedMatchView>;
  getActionCards(): Promise<ActionCardView[]>;
  getMoments(fixtureId?: number): Promise<MomentView[]>;
  getBoothContext(): Promise<BoothContext>;
  getSettlementBadge(): Promise<SettlementBadgeView>;
  listFixtures(): Promise<FeaturedMatchView[]>;
}
