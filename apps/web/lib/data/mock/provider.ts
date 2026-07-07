import { AppRoute } from "@/lib/enums";
import {
  FIXTURE_CATALOG,
  getFeaturedFixture,
} from "@/lib/constants/fixtures";
import type { IDataProvider } from "@/lib/data/provider";
import {
  catalogToMatchView,
  enrichFixtureWithTxlineOdds,
} from "@/lib/data/txline/enrich";
import {
  MOCK_ACTION_CARDS,
  MOCK_MOMENTS,
  MOCK_SETTLEMENT_BADGE,
} from "@/lib/data/mock/fixtures";

export const mockDataProvider: IDataProvider = {
  async getFeaturedMatch() {
    return catalogToMatchView(getFeaturedFixture());
  },

  async getActionCards() {
    return MOCK_ACTION_CARDS;
  },

  async getMoments(fixtureId) {
    if (fixtureId === undefined) return MOCK_MOMENTS;
    return MOCK_MOMENTS.filter((moment) => moment.fixtureId === fixtureId);
  },

  async getBoothContext() {
    const match = await this.getFeaturedMatch();
    return {
      fixtureId: match.fixtureId,
      ref: match.ref,
      homeTeam: match.home.name,
      awayTeam: match.away.name,
      homeFlag: match.home.flag,
      awayFlag: match.away.flag,
      round: match.round,
      market: "match_winner",
    };
  },

  async getSettlementBadge() {
    return MOCK_SETTLEMENT_BADGE;
  },

  async listFixtures() {
    return FIXTURE_CATALOG.map((fixture) => catalogToMatchView(fixture));
  },
};

export const txlineDataProvider: IDataProvider = {
  async getFeaturedMatch() {
    return enrichFixtureWithTxlineOdds(getFeaturedFixture());
  },

  async getActionCards() {
    return MOCK_ACTION_CARDS;
  },

  async getMoments(fixtureId) {
    if (fixtureId === undefined) return MOCK_MOMENTS;
    return MOCK_MOMENTS.filter((moment) => moment.fixtureId === fixtureId);
  },

  async getBoothContext() {
    const match = await this.getFeaturedMatch();
    return {
      fixtureId: match.fixtureId,
      ref: match.ref,
      homeTeam: match.home.name,
      awayTeam: match.away.name,
      homeFlag: match.home.flag,
      awayFlag: match.away.flag,
      round: match.round,
      market: "match_winner",
    };
  },

  async getSettlementBadge() {
    return MOCK_SETTLEMENT_BADGE;
  },

  async listFixtures() {
    return Promise.all(
      FIXTURE_CATALOG.map((fixture) => enrichFixtureWithTxlineOdds(fixture)),
    );
  },
};
