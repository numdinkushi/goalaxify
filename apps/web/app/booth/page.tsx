import { BoothPageContent } from "@/components/booth/booth-page-content";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { getDataProvider } from "@/lib/data";

export default async function BoothPage() {
  const boothContext = await getDataProvider().getBoothContext();

  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-8">
        <PageHeader
          eyebrow="Prediction booth"
          title="Talk your bet"
          description="Voice-native predictions for tonight's featured match. Speak your market, selection, and stake."
        />
        <BoothPageContent context={boothContext} />
      </main>
    </AppShell>
  );
}
