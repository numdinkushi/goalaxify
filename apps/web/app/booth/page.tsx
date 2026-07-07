import { Suspense } from "react";

import { BoothMatchesSection } from "@/components/booth/booth-matches-section";
import { BoothPageLoader, BoothPageShell } from "@/components/booth/booth-page-shell";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

type BoothPageProps = {
  searchParams: Promise<{ fixture?: string; prediction?: string }>;
};

export default async function BoothPage({ searchParams }: BoothPageProps) {
  const { fixture, prediction } = await searchParams;
  const requestedFixtureId = fixture ? Number(fixture) : undefined;
  const initialFixtureId = Number.isFinite(requestedFixtureId)
    ? requestedFixtureId
    : undefined;

  return (
    <AppShell>
      <BoothPageShell>
        <Suspense fallback={<BoothPageLoader />}>
          <BoothMatchesSection
            initialFixtureId={initialFixtureId}
            managePredictionId={prediction}
          />
        </Suspense>
      </BoothPageShell>
    </AppShell>
  );
}
