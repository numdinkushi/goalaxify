import { Suspense } from "react";

import { BoothMatchesSection } from "@/components/booth/booth-matches-section";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LogoLoader } from "@/components/ui/logo-loader";

export const dynamic = "force-dynamic";

type BoothPageProps = {
  searchParams: Promise<{ fixture?: string }>;
};

export default async function BoothPage({ searchParams }: BoothPageProps) {
  const { fixture } = await searchParams;
  const requestedFixtureId = fixture ? Number(fixture) : undefined;
  const initialFixtureId = Number.isFinite(requestedFixtureId)
    ? requestedFixtureId
    : undefined;

  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-8">
        <PageHeader
          eyebrow="Prediction booth"
          title="Talk your bet"
          description="Pick any upcoming match, then speak your market, selection, and stake to the stadium announcer."
        />
        <Suspense
          fallback={<LogoLoader message="Loading matches for the booth…" />}
        >
          <BoothMatchesSection initialFixtureId={initialFixtureId} />
        </Suspense>
      </main>
    </AppShell>
  );
}
