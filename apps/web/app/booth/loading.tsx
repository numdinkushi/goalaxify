import { AppShell } from "@/components/layout/app-shell";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function BoothLoading() {
  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-8">
        <LogoLoader message="Opening the prediction booth…" className="min-h-[40vh]" />
      </main>
    </AppShell>
  );
}
