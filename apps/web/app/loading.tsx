import { AppShell } from "@/components/layout/app-shell";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function HomeLoading() {
  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-8 pb-8 px-6 pt-4">
        <LogoLoader message="Loading Goalaxify…" className="min-h-[50vh]" />
      </main>
    </AppShell>
  );
}
