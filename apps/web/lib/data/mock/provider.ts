import type { IDataProvider } from "@/lib/data/provider";
import {
  fetchFeaturedMatch,
  fetchUpcomingMatches,
} from "@/lib/data/txline/enrich";
import { fetchLiveMoments } from "@/lib/data/txline/fetch-moments";
import {
  MOCK_ACTION_CARDS,
  MOCK_SETTLEMENT_BADGE,
} from "@/lib/data/mock/fixtures";
import { matchToBoothContext } from "@/lib/data/booth-context";
import { MatchStatus } from "@/lib/enums";

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
    const matches = await this.getUpcomingMatches();
    const targets =
      fixtureId !== undefined
        ? matches.filter((match) => match.fixtureId === fixtureId)
        : matches.filter(
            (match) =>
              match.status === MatchStatus.Live ||
              match.status === MatchStatus.Halftime,
          );

    if (targets.length === 0) {
      return [];
    }

    const momentSets = await Promise.all(
      targets.map((match) =>
        fetchLiveMoments(match.fixtureId, match.home.name, match.away.name),
      ),
    );

    return momentSets.flat();
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
