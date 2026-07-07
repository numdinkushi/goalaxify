import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  SUPPORTED_LANGUAGES,
} from "@/lib/i18n/language-constants";

const STORAGE_KEY = "goalaxify-language";

export function detectBrowserLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const browserLang = navigator.language || navigator.languages?.[0] || "";
  if (!browserLang) {
    return DEFAULT_LANGUAGE;
  }

  const langCode = browserLang.toLowerCase().split("-")[0] as LanguageCode;
  if (langCode in SUPPORTED_LANGUAGES) {
    return langCode;
  }

  return DEFAULT_LANGUAGE;
}

export function getStoredLanguage(): LanguageCode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored || !(stored in SUPPORTED_LANGUAGES)) {
    return null;
  }

  return stored as LanguageCode;
}

export function saveLanguageToStorage(language: LanguageCode): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, language);
}

export function getInitialLanguage(): LanguageCode {
  return getStoredLanguage() ?? detectBrowserLanguage();
}
