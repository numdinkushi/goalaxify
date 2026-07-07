import { ActionCards } from "@/components/home/action-cards";
import { HeroSection } from "@/components/home/hero-section";
import { MatchSpotlightCard } from "@/components/home/match-spotlight-card";
import { AppShell } from "@/components/layout/app-shell";
import { getDataProvider } from "@/lib/data";

export default async function Page() {
  const data = getDataProvider();
  const [featuredMatch, actions, settlement] = await Promise.all([
    data.getFeaturedMatch(),
    data.getActionCards(),
    data.getSettlementBadge(),
  ]);

  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-8 pb-8">
        <HeroSection />

        <div className="flex flex-col gap-8 px-6">
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-brand-pastel-pink uppercase">
                  Tonight
                </p>
                <h2 className="text-lg font-semibold">Featured match</h2>
              </div>
            </div>
            <MatchSpotlightCard match={featuredMatch} />
          </section>

          <ActionCards actions={actions} settlement={settlement} />
        </div>
      </main>
    </AppShell>
  );
}
