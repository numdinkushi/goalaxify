"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useWalletProfile } from "@/hooks/use-wallet-profile";
import { resolveDataSourceFromEnv, isConvexConfigured } from "@/lib/env/runtime";
import { isTxlineConfigured } from "@/lib/data/txline/enrich";
import { isVapiCallsEnabled } from "@/lib/vapi/feature-flags";
import { shortWalletAddress } from "@/lib/wallet/utils";

export function SettingsPageContent() {
  const dataSource = resolveDataSourceFromEnv();
  const { isConnected, walletPubkey, profile } = useWalletProfile();

  const integrations = [
    { name: "Data source", value: dataSource },
    { name: "Wallet", value: isConnected ? shortWalletAddress(walletPubkey) : "Not connected" },
    { name: "Convex profile", value: profile ? "Synced" : isConnected ? "Pending" : "—" },
    { name: "TxLINE API", value: isTxlineConfigured() ? "Configured" : "Mock fallback" },
    { name: "Convex", value: isConvexConfigured() ? "Connected" : "Not configured" },
    { name: "Vapi voice", value: isVapiCallsEnabled() ? "Enabled" : "Disabled" },
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
