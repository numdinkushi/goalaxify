import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
} from "@/lib/i18n/language-constants";
import { translations } from "@/lib/i18n/locales";

type TranslationKey = string;
type TranslationValue = string | Record<string, unknown>;

interface Translations {
  [key: string]: TranslationValue;
}

const translationMap = translations as Record<LanguageCode, Translations>;

function loadTranslations(language: LanguageCode): Translations {
  return translationMap[language] ?? translationMap[DEFAULT_LANGUAGE];
}

function getNestedValue(obj: unknown, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof value === "string" ? value : undefined;
}

export class TranslationService {
  private currentLanguage: LanguageCode = DEFAULT_LANGUAGE;
  private currentTranslations: Translations = loadTranslations(DEFAULT_LANGUAGE);
  private listeners = new Set<() => void>();

  setLanguage(language: LanguageCode) {
    if (this.currentLanguage === language) {
      return;
    }

    this.currentLanguage = language;
    this.currentTranslations = loadTranslations(language);
    this.listeners.forEach((callback) => callback());
  }

  t(key: TranslationKey, params?: Record<string, string | number>): string {
    const value = getNestedValue(this.currentTranslations, key);
    if (!value) {
      return key;
    }

    if (!params) {
      return value;
    }

    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() ?? match;
    });
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
