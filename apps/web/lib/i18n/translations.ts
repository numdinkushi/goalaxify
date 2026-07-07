import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
} from "@/lib/i18n/language-constants";
import { lookupTranslation } from "@/lib/i18n/translate";

export { lookupTranslation, lookupTranslation as translate } from "@/lib/i18n/translate";

type TranslationKey = string;

export class TranslationService {
  private currentLanguage: LanguageCode = DEFAULT_LANGUAGE;
  private listeners = new Set<() => void>();

  setLanguage(language: LanguageCode) {
    if (this.currentLanguage === language) {
      return;
    }

    this.currentLanguage = language;
    this.listeners.forEach((listener) => {
      if (typeof listener === "function") {
        listener();
      }
    });
  }

  t(key: TranslationKey, params?: Record<string, string | number>): string {
    return lookupTranslation(key, this.currentLanguage, params);
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  getCurrentLanguage(): LanguageCode {
    return this.currentLanguage;
  }
}

let translationService: TranslationService | null = null;

export function getTranslationService(): TranslationService {
  if (!translationService) {
    translationService = new TranslationService();
  }
  return translationService;
}
