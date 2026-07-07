import type { IDataProvider } from "@/lib/data/provider";
import {
  fetchFeaturedMatch,
  fetchUpcomingMatches,
} from "@/lib/data/txline/enrich";
import {
  MOCK_ACTION_CARDS,
  MOCK_MOMENTS,
  MOCK_SETTLEMENT_BADGE,
} from "@/lib/data/mock/fixtures";
import { matchToBoothContext } from "@/lib/data/booth-context";

/** TxLINE-only data provider — never serves hardcoded fixture/odds data. */
export const txlineDataProvider: IDataProvider = {
  async getFeaturedMatch() {
    return fetchFeaturedMatch();
  },

  async getUpcomingMatches() {
    return fetchUpcomingMatches();
  },

  async getActionCards() {
    return MOCK_ACTION_CARDS;
  },

  async getMoments(fixtureId) {
    if (fixtureId === undefined) return MOCK_MOMENTS;
    return MOCK_MOMENTS.filter((moment) => moment.fixtureId === fixtureId);
  },

  async getBoothContext(fixtureId?: number) {
    const matches = await this.getUpcomingMatches();
    const match =
      fixtureId !== undefined
        ? matches.find((entry) => entry.fixtureId === fixtureId)
        : matches[0];

    if (!match) {
      throw new Error("No live match data available for the booth");
    }

    return matchToBoothContext(match);
  },

  async getSettlementBadge() {
    return MOCK_SETTLEMENT_BADGE;
  },

  async listFixtures() {
    return this.getUpcomingMatches();
  },
};

/** @deprecated Use txlineDataProvider — returns empty match data, never mock fixtures. */
export const mockDataProvider: IDataProvider = txlineDataProvider;
