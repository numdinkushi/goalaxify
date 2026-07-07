"use client";

import { PageHeader } from "@/components/layout/page-header";
import { LogoLoader } from "@/components/ui/logo-loader";
import { useTranslation } from "@/hooks/use-translation";

type BoothPageHeaderProps = {
  children: React.ReactNode;
};

export function BoothPageShell({ children }: BoothPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-8">
      <PageHeader
        eyebrow={t("booth.eyebrow")}
        title={t("booth.title")}
        description={t("booth.description")}
      />
      {children}
    </main>
  );
}

export function BoothPageLoader() {
  const { t } = useTranslation();
  return <LogoLoader message={t("booth.loading")} />;
}
