import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  SUPPORTED_LANGUAGES,
} from "@/lib/i18n/language-constants";

/** Voice booth instructions per IQlify / Vapi supported language. */
export const VOICE_LANGUAGE_INSTRUCTIONS: Record<LanguageCode, string> = {
  en: "Speak in clear, energetic stadium-announcer English. Understand casual football slang.",
  es: "Habla en español con energía de narrador de estadio. Entiende apodos de equipos y jerga futbolera.",
  fr: "Parle en français avec l'énergie d'un speaker de stade. Comprends le langage des supporters.",
  pt: "Fale português com energia de locutor de estádio. Entenda gírias do futebol.",
  de: "Sprich Deutsch mit Stadion-Moderator-Energie. Verstehe lockere Fußball-Umgangssprache.",
  it: "Parla italiano con stile da telecronaca. Capisci il linguaggio da tifoso.",
  zh: "用中文进行对话，语气像热情的球场解说员。理解球迷口语。",
  ja: "日本語でスタジアムアナウンサーのように話してください。サッカーファンの口語も理解してください。",
  ko: "한국어로 경기장 아나운서처럼 말하세요. 축구 팬들의 구어체를 이해하세요.",
  ar: "تحدث بالعربية بطاقة مذيع الملعب. افهم لغة مشجعي كرة القدم اليومية.",
};

export function getBoothTranscriberConfig(
  language: LanguageCode = DEFAULT_LANGUAGE,
) {
  if (language === "en") {
    return {
      provider: "deepgram" as const,
      model: "flux-general-en",
      language: "en",
    };
  }

  return {
    provider: "deepgram" as const,
    model: "nova-2",
    language,
  };
}

export function buildVoiceLanguagePromptBlock(
  language: LanguageCode = DEFAULT_LANGUAGE,
) {
  const info = SUPPORTED_LANGUAGES[language];
  return [
    `LANGUAGE: Conduct the entire booth session in ${info.nativeName} (${info.name}).`,
    VOICE_LANGUAGE_INSTRUCTIONS[language],
    "Do not switch languages unless the fan clearly switches.",
  ].join("\n");
}
