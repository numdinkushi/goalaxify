import { Suspense } from "react";

import { ActionCards } from "@/components/home/action-cards";
import { HeroSection } from "@/components/home/hero-section";
import { UpcomingMatchesSection } from "@/components/home/upcoming-matches-section";
import { AppShell } from "@/components/layout/app-shell";
import { LogoLoader } from "@/components/ui/logo-loader";
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
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-brand-pastel-pink uppercase">
                World Cup 2026
              </p>
              <h2 className="text-lg font-semibold">Predict a match</h2>
            </div>
            <Suspense
              fallback={
                <LogoLoader message="Loading World Cup fixtures and odds…" />
              }
            >
              <UpcomingMatchesSection />
            </Suspense>
          </section>

          <ActionCards actions={actions} settlement={settlement} />
        </div>
      </main>
    </AppShell>
  );
}
