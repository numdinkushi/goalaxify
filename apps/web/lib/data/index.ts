import { DataSource } from "@/lib/enums";
import type { IDataProvider } from "@/lib/data/provider";
import { txlineDataProvider } from "@/lib/data/mock/provider";
import { isTxlineConfigured } from "@/lib/data/txline/enrich";

function resolveDataSource(): DataSource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE;

  if (source === DataSource.Convex) return DataSource.Convex;
  if (source === DataSource.Txline) return DataSource.Txline;
  if (source === DataSource.Mock) return DataSource.Mock;

  return isTxlineConfigured() ? DataSource.Txline : DataSource.Mock;
}

/**
 * Match and odds data always flows through the TxLINE provider.
 * When TxLINE is unavailable, pages show an empty state — never hardcoded fixtures.
 */
export function getDataProvider(): IDataProvider {
  return txlineDataProvider;
}

export { resolveDataSource };
