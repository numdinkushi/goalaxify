"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useWalletProfile } from "@/hooks/use-wallet-profile";
import { resolveDataSourceFromEnv, isConvexConfigured } from "@/lib/env/runtime";
import { getAppSettlementConfig } from "@/lib/settlement/config";
import type { PipelineCheck } from "@/lib/settlement/status";
import { isVapiCallsEnabled } from "@/lib/vapi/feature-flags";
import { shortWalletAddress } from "@/lib/wallet/utils";

type SettingsPageContentProps = {
  pipeline: PipelineCheck[];
  txlineConfigured: boolean;
};

export function SettingsPageContent({
  pipeline,
  txlineConfigured,
}: SettingsPageContentProps) {
  const dataSource = resolveDataSourceFromEnv();
  const { isConnected, walletPubkey, profile } = useWalletProfile();
  const settlement = getAppSettlementConfig();

  const integrations = [
    { name: "Data source", value: dataSource },
    { name: "Wallet", value: isConnected ? shortWalletAddress(walletPubkey) : "Not connected" },
    { name: "Convex profile", value: profile ? "Synced" : isConnected ? "Pending" : "—" },
    { name: "TxLINE API", value: txlineConfigured ? "Configured" : "Not configured" },
    { name: "Convex", value: isConvexConfigured() ? "Connected" : "Not configured" },
    { name: "Vapi voice", value: isVapiCallsEnabled() ? "Enabled" : "Disabled" },
    { name: "Solana network", value: settlement.network },
    { name: "Settlement program", value: shortWalletAddress(settlement.programId, 6) },
  ];

  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-8">
        <PageHeader
          eyebrow="Configuration"
          title="Settings"
          description="Environment and integration status for the Goalaxify stack."
        />

        <Card>
          <CardContent className="divide-y divide-border p-0">
            {pipeline.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className={item.ready ? "text-brand-mint" : "text-muted-foreground"}>
                  {item.ready ? "Ready" : "Pending"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="divide-y divide-border p-0">
            {integrations.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between px-5 py-4 text-sm"
              >
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium capitalize">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </AppShell>
  );
}
