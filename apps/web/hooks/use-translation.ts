"use client";

import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "@/components/providers/language-provider";
import {
  getTranslationService,
  type TranslationService,
} from "@/lib/i18n/translations";

export function useTranslation() {
  const { language } = useLanguage();
  const [service] = useState<TranslationService>(() => getTranslationService());
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    service.setLanguage(language);
    setRevision((value) => value + 1);
  }, [language, service]);

  useEffect(() => {
    return service.subscribe(() => {
      setRevision((value) => value + 1);
    });
  }, [service]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return service.t(key, params);
    },
    [service, revision],
  );

  return { t, language };
}
