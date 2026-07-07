export type LanguageCode =
  | "en"
  | "es"
  | "fr"
  | "pt"
  | "de"
  | "it"
  | "zh"
  | "ja"
  | "ko"
  | "ar";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Record<LanguageCode, Language> = {
  en: { code: "en", name: "English", nativeName: "English" },
  es: { code: "es", name: "Spanish", nativeName: "Español" },
  fr: { code: "fr", name: "French", nativeName: "Français" },
  pt: { code: "pt", name: "Portuguese", nativeName: "Português" },
  de: { code: "de", name: "German", nativeName: "Deutsch" },
  it: { code: "it", name: "Italian", nativeName: "Italiano" },
  zh: { code: "zh", name: "Chinese", nativeName: "中文" },
  ja: { code: "ja", name: "Japanese", nativeName: "日本語" },
  ko: { code: "ko", name: "Korean", nativeName: "한국어" },
  ar: { code: "ar", name: "Arabic", nativeName: "العربية" },
};

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const LANGUAGE_CODES = Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
