import ar from "./ar";
import de from "./de";
import en from "./en";
import es from "./es";
import fr from "./fr";
import it from "./it";
import ja from "./ja";
import ko from "./ko";
import pt from "./pt";
import zh from "./zh";
import type { LanguageCode } from "../language-constants";

export const translations: Record<LanguageCode, typeof en> = {
  en,
  es,
  fr,
  pt,
  de,
  it,
  zh,
  ja,
  ko,
  ar,
};
