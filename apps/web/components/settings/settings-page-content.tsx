"use client";

import { useState } from "react";
import { Info, Settings2 } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { AppShell } from "@/components/layout/app-shell";
import { LanguageSelector } from "@/components/settings/language-selector";
import { PrivacyPolicyContent } from "@/components/settings/privacy-policy-content";
import { SupportContent } from "@/components/settings/support-content";
import { TermsOfServiceContent } from "@/components/settings/terms-content";
import { useLanguage } from "@/components/providers/language-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/language-constants";

export function SettingsPageContent() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const { language } = useLanguage();
  const { t } = useTranslation();

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 pt-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-brand-coral">{t("settings.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="size-5 text-brand-coral" />
              <CardTitle className="text-brand-coral">
                {t("settings.preferences.title")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  {t("settings.preferences.language")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {SUPPORTED_LANGUAGES[language].nativeName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("language.selectDescription")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguageOpen(true)}
              >
                {t("settings.preferences.change")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="size-5 text-brand-coral" />
              <CardTitle className="text-brand-coral">
                {t("settings.about.title")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-brand-coral/15">
                <BrandLogo size={40} />
              </div>
              <h3 className="text-lg font-semibold text-brand-coral">Goalaxify</h3>
              <p className="text-sm text-muted-foreground">
                {t("settings.about.version")}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("settings.about.tagline")}
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPrivacyOpen(true)}
              >
                {t("settings.privacy")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setTermsOpen(true)}
              >
                {t("settings.terms")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSupportOpen(true)}
              >
                {t("settings.support")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomSheet
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title={t("settings.privacy")}
      >
        <PrivacyPolicyContent />
      </BottomSheet>

      <BottomSheet
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        title={t("settings.terms")}
      >
        <TermsOfServiceContent />
      </BottomSheet>

      <BottomSheet
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
        title={t("settings.support")}
      >
        <SupportContent />
      </BottomSheet>

      <BottomSheet
        isOpen={languageOpen}
        onClose={() => setLanguageOpen(false)}
        title={t("language.selectTitle")}
      >
        <LanguageSelector />
      </BottomSheet>
    </AppShell>
  );
}
