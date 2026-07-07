import { Suspense } from "react";

import { LivePageContent } from "@/components/live/live-page-content";
import { LivePageLoader, LivePageShell } from "@/components/live/live-page-shell";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default function LivePage() {
  return (
    <AppShell>
      <LivePageShell>
        <Suspense fallback={<LivePageLoader />}>
          <LivePageContent />
        </Suspense>
      </LivePageShell>
    </AppShell>
  );
}
