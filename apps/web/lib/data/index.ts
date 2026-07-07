import { DataSource } from "@/lib/enums";
import type { IDataProvider } from "@/lib/data/provider";
import { mockDataProvider } from "@/lib/data/mock/provider";
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
 * Factory for the active data provider.
 * Auto-selects TxLINE when credentials exist unless NEXT_PUBLIC_DATA_SOURCE=mock.
 */
export function getDataProvider(): IDataProvider {
  const source = resolveDataSource();

  if (source === DataSource.Txline) {
    return txlineDataProvider;
  }

  return mockDataProvider;
}

export { resolveDataSource };
