import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { isTxlineConfigured } from "@/lib/data/txline/enrich";
import { resolveDataSourceFromEnv, isConvexConfigured } from "@/lib/env/runtime";
import { isVapiCallsEnabled } from "@/lib/vapi/feature-flags";

export default function SettingsPage() {
  const dataSource = resolveDataSourceFromEnv();

  const integrations = [
    { name: "Data source", value: dataSource },
    { name: "TxLINE API", value: isTxlineConfigured() ? "Configured" : "Mock fallback" },
    { name: "Convex", value: isConvexConfigured() ? "Connected" : "Not configured" },
    { name: "Vapi voice", value: isVapiCallsEnabled() ? "Enabled" : "Disabled" },
  ];

  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-8 pb-8">
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
