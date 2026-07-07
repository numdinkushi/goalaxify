import { Suspense } from "react";

import { LivePageContent } from "@/components/live/live-page-content";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LogoLoader } from "@/components/ui/logo-loader";

export const dynamic = "force-dynamic";

export default function LivePage() {
  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-8 pb-8">
        <PageHeader
          eyebrow="Live pulse"
          title="The Pitch"
          description="Goal moments, halftime checks, and match rhythm when a World Cup match is in play."
        />
        <Suspense fallback={<LogoLoader message="Checking for live matches…" />}>
          <LivePageContent />
        </Suspense>
      </main>
    </AppShell>
  );
}
