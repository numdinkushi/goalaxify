import { Wallet } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function WalletPage() {
  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-8 pb-8">
        <PageHeader
          eyebrow="Settlement"
          title="Wallet"
          description="Connect your wallet to view stakes, proofs, and TxLINE settlement status."
        />

        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-dusty-blue/15 text-brand-dusty-blue">
              <Wallet className="size-7" />
            </div>
            <p className="text-sm text-muted-foreground">
              Wallet connection and on-chain settlement proofs are coming next.
              Dummy data is active until Solana integration is wired.
            </p>
          </CardContent>
        </Card>
      </main>
    </AppShell>
  );
}
