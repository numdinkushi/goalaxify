import { Suspense } from "react";

import { ActionCards } from "@/components/home/action-cards";
import { HeroSection } from "@/components/home/hero-section";
import { HomeMatchesLoader } from "@/components/home/home-matches-loader";
import { HomeMatchesSectionHeader } from "@/components/home/home-matches-section-header";
import { UpcomingMatchesSection } from "@/components/home/upcoming-matches-section";
import { AppShell } from "@/components/layout/app-shell";
import { getDataProvider } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = getDataProvider();
  const [actions, settlement] = await Promise.all([
    data.getActionCards(),
    data.getSettlementBadge(),
  ]);

  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-8 pb-8">
        <HeroSection />

        <div className="flex flex-col gap-5 px-6">
          <section className="space-y-3">
            <HomeMatchesSectionHeader />
            <Suspense fallback={<HomeMatchesLoader />}>
              <UpcomingMatchesSection />
            </Suspense>
          </section>

          <ActionCards actions={actions} settlement={settlement} />
        </div>
      </main>
    </AppShell>
  );
}
