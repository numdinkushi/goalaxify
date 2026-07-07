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

function getNestedValue(obj: unknown, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof value === "string" ? value : undefined;
}

export function lookupTranslation(
  key: TranslationKey,
  language: LanguageCode = DEFAULT_LANGUAGE,
  params?: Record<string, string | number>,
): string {
  let value = getNestedValue(translationMap[language], key);

  if (!value && language !== DEFAULT_LANGUAGE) {
    value = getNestedValue(translationMap[DEFAULT_LANGUAGE], key);
  }

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
