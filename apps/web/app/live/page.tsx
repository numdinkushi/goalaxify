import { MomentFeed } from "@/components/live/moment-feed";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { getDataProvider } from "@/lib/data";

export default async function LivePage() {
  const data = getDataProvider();
  const [featuredMatch, moments] = await Promise.all([
    data.getFeaturedMatch(),
    data.getMoments(),
  ]);

  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-8 pb-8">
        <PageHeader
          eyebrow="Live pulse"
          title="The Pitch"
          description="Goal moments, halftime checks, and match rhythm as the booth stays open."
        />
        <MomentFeed
          moments={moments}
          homeTeam={featuredMatch.home.name}
          awayTeam={featuredMatch.away.name}
        />
      </main>
    </AppShell>
  );
}
