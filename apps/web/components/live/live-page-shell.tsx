"use client";

import { PageHeader } from "@/components/layout/page-header";
import { LogoLoader } from "@/components/ui/logo-loader";
import { useTranslation } from "@/hooks/use-translation";

type LivePageShellProps = {
  children: React.ReactNode;
};

export function LivePageShell({ children }: LivePageShellProps) {
  const { t } = useTranslation();

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-8 pb-8">
      <PageHeader
        eyebrow={t("live.eyebrow")}
        title={t("live.title")}
        description={t("live.description")}
      />
      {children}
    </main>
  );
}

export function LivePageLoader() {
  const { t } = useTranslation();
  return <LogoLoader message={t("live.loading")} />;
}
