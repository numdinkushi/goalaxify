import {
  getNetworkScopedEnvKey,
  getTxlineNetworkFromEnv,
  resolveTxlineApiToken,
} from "@goalaxify/config";
import { NextResponse } from "next/server";

import {
  isTxlineConfiguredForRequest,
  resolveTxlineCredentialsForServer,
} from "@/lib/data/txline/credentials-server";
import { mapTxlineFixturesSnapshot } from "@/lib/data/txline/map-fixtures";
import {
  getDeploymentSettlementNetwork,
  getRequestSettlementNetwork,
} from "@/lib/solana/network-server";

export async function GET() {
  const deploymentNetwork = getDeploymentSettlementNetwork();
  const requestNetwork = await getRequestSettlementNetwork();
  const apiTokenKey = getNetworkScopedEnvKey(
    "TXLINE_API_TOKEN",
    requestNetwork,
  );
  const guestJwtKey = getNetworkScopedEnvKey(
    "TXLINE_GUEST_JWT",
    requestNetwork,
  );

  const configured = await isTxlineConfiguredForRequest();
  const auth = configured ? await resolveTxlineCredentialsForServer() : null;

  let fixtureCount: number | null = null;
  let apiError: string | null = null;

  if (auth) {
    try {
      const { TxlineClient } = await import("@goalaxify/txline-sdk/client");
      const client = new TxlineClient({
        credentials: {
          guestJwt: auth.guestJwt,
          apiToken: auth.apiToken,
        },
        network: auth.network,
      });
      const snapshot = await client.listFixtures();
      fixtureCount = mapTxlineFixturesSnapshot(snapshot).length;
    } catch (error) {
      apiError =
        error instanceof Error ? error.message : "TxLINE fixtures request failed";
    }
  }

  return NextResponse.json({
    ok: configured && fixtureCount !== null && !apiError,
    configured,
    deploymentNetwork,
    requestNetwork,
    envDefaultNetwork: getTxlineNetworkFromEnv(),
    envKeysPresent: {
      apiToken: Boolean(process.env[apiTokenKey] ?? process.env.TXLINE_API_TOKEN),
      guestJwt: Boolean(process.env[guestJwtKey] ?? process.env.TXLINE_GUEST_JWT),
      apiTokenKey,
      guestJwtKey,
    },
    apiTokenConfigured: Boolean(
      resolveTxlineApiToken(process.env, requestNetwork),
    ),
    guestSessionRefreshed: Boolean(auth),
    fixtureCount,
    apiError,
  });
}
