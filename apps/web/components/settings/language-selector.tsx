"use client";

import { Check, Globe } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from "@/hooks/use-translation";
import {
  LANGUAGE_CODES,
  SUPPORTED_LANGUAGES,
} from "@/lib/i18n/language-constants";
import { cn } from "@/lib/utils";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="space-y-3 pb-2">
      <p className="mb-4 text-sm text-muted-foreground">
        {t("language.selectDescription")}
      </p>

      {LANGUAGE_CODES.map((langCode) => {
        const lang = SUPPORTED_LANGUAGES[langCode];
        const isSelected = language === langCode;

        return (
          <button
            key={langCode}
            type="button"
            onClick={() => setLanguage(langCode)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all active:scale-[0.98]",
              isSelected
                ? "border-brand-coral bg-brand-coral text-white"
                : "border-border bg-card hover:border-brand-coral/40",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "rounded-lg p-2",
                  isSelected ? "bg-white/20" : "bg-muted",
                )}
              >
                <Globe className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-medium">{lang.nativeName}</p>
                <p
                  className={cn(
                    "text-xs",
                    isSelected ? "text-white/80" : "text-muted-foreground",
                  )}
                >
                  {lang.name}
                </p>
              </div>
            </div>

            {isSelected ? <Check className="size-5" /> : null}
          </button>
        );
      })}
    </div>
  );
}
