import { DataSource } from "@/lib/enums";
import { isTxlineConfigured } from "@/lib/data/txline/enrich";

export function isConvexConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_CONVEX_URL;
}

export function resolveDataSourceFromEnv(): DataSource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE;

  if (source === DataSource.Convex) return DataSource.Convex;
  if (source === DataSource.Txline) return DataSource.Txline;
  if (source === DataSource.Mock) return DataSource.Mock;

  return isTxlineConfigured() ? DataSource.Txline : DataSource.Mock;
}
