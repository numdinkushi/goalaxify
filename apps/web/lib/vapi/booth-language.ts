import type { BoothContext, BoothManageBet } from "@/lib/data/types";
import type { BoothSessionMode } from "@/lib/enums";
import { BoothSessionMode as BoothSessionModeEnum } from "@/lib/enums";
import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
} from "@/lib/i18n/language-constants";
import {
  buildVoiceLanguagePromptBlock,
  getBoothTranscriberConfig,
} from "@/lib/i18n/voice-language";
import { formatKickoffTime } from "@/lib/utils/format";
import { formatScheduleDayLabel } from "@/lib/utils/schedule";

export { getBoothTranscriberConfig, buildVoiceLanguagePromptBlock };

export function buildBoothFirstMessageForLanguage(
  context: BoothContext,
  language: LanguageCode = DEFAULT_LANGUAGE,
  options: {
    mode?: BoothSessionMode;
    manageBet?: BoothManageBet | null;
  } = {},
): string {
  const kickoffHint = context.kickoffAt
    ? ` ${formatScheduleDayLabel(context.kickoffAt)} ${formatKickoffTime(context.kickoffAt)}.`
    : "";

  const manageBet = options.manageBet;
  if (options.mode === BoothSessionModeEnum.Manage && manageBet) {
    const localized: Record<LanguageCode, string> = {
      en: `Welcome back to the booth! You're on ${manageBet.homeTeam} versus ${manageBet.awayTeam} with ${manageBet.stakeAmount} ${manageBet.stakeToken} on ${manageBet.selection}.${kickoffHint} Cancel for a full refund, or replace with a new pick?`,
      es: `¡Bienvenido otra vez al booth! Tienes ${manageBet.stakeAmount} ${manageBet.stakeToken} en ${manageBet.selection} para ${manageBet.homeTeam} vs ${manageBet.awayTeam}.${kickoffHint} ¿Cancelar o cambiar?`,
      fr: `Bon retour au booth ! Mise : ${manageBet.stakeAmount} ${manageBet.stakeToken} sur ${manageBet.selection}, ${manageBet.homeTeam} vs ${manageBet.awayTeam}.${kickoffHint} Annuler ou remplacer ?`,
      pt: `Bem-vindo de volta ao booth! Aposta: ${manageBet.homeTeam} x ${manageBet.awayTeam}, ${manageBet.stakeAmount} ${manageBet.stakeToken} em ${manageBet.selection}.${kickoffHint} Cancelar ou trocar?`,
      de: `Willkommen zurück im Booth! Einsatz: ${manageBet.stakeAmount} ${manageBet.stakeToken} auf ${manageBet.selection}, ${manageBet.homeTeam} vs ${manageBet.awayTeam}.${kickoffHint} Stornieren oder ersetzen?`,
      it: `Bentornato al booth! Puntata: ${manageBet.stakeAmount} ${manageBet.stakeToken} su ${manageBet.selection}, ${manageBet.homeTeam} vs ${manageBet.awayTeam}.${kickoffHint} Annullare o sostituire?`,
      zh: `欢迎回到 booth！您在 ${manageBet.homeTeam} 对 ${manageBet.awayTeam} 的投注为 ${manageBet.stakeAmount} ${manageBet.stakeToken}，选择 ${manageBet.selection}。${kickoffHint} 取消全额退款还是更换？`,
      ja: `ブースへおかえりなさい！${manageBet.homeTeam} 対 ${manageBet.awayTeam} に ${manageBet.stakeAmount} ${manageBet.stakeToken}、${manageBet.selection} です。${kickoffHint} キャンセルして全額返金しますか、それとも変更しますか？`,
      ko: `부스에 다시 오신 것을 환영합니다! ${manageBet.homeTeam} vs ${manageBet.awayTeam}, ${manageBet.stakeAmount} ${manageBet.stakeToken}, ${manageBet.selection}.${kickoffHint} 취소 환불 또는 변경하시겠습니까?`,
      ar: `مرحباً بعودتك إلى الكشك! رهانك: ${manageBet.homeTeam} مقابل ${manageBet.awayTeam}، ${manageBet.stakeAmount} ${manageBet.stakeToken} على ${manageBet.selection}.${kickoffHint} إلغاء واسترداد كامل أم استبدال؟`,
    };

    return localized[language];
  }

  const localized: Record<LanguageCode, string> = {
    en: `Welcome to the Goalaxify booth! ${context.homeTeam} versus ${context.awayTeam} — ${context.round}.${kickoffHint} Who wins, and how much SOL or USDC do you want to stake?`,
    es: `¡Bienvenido al booth Goalaxify! ${context.homeTeam} contra ${context.awayTeam}, ${context.round}.${kickoffHint} ¿Quién gana y cuánto SOL o USDC quieres apostar?`,
    fr: `Bienvenue au booth Goalaxify ! ${context.homeTeam} contre ${context.awayTeam}, ${context.round}.${kickoffHint} Qui gagne, et combien de SOL ou USDC mises-tu ?`,
    pt: `Bem-vindo ao booth Goalaxify! ${context.homeTeam} x ${context.awayTeam}, ${context.round}.${kickoffHint} Quem ganha e quanto SOL ou USDC você quer apostar?`,
    de: `Willkommen im Goalaxify-Booth! ${context.homeTeam} gegen ${context.awayTeam}, ${context.round}.${kickoffHint} Wer gewinnt, und wie viel SOL oder USDC setzt du?`,
    it: `Benvenuto al booth Goalaxify! ${context.homeTeam} contro ${context.awayTeam}, ${context.round}.${kickoffHint} Chi vince e quanto SOL o USDC vuoi puntare?`,
    zh: `欢迎来到 Goalaxify booth！${context.homeTeam} 对 ${context.awayTeam}，${context.round}。${kickoffHint} 谁赢？你想押多少 SOL 或 USDC？`,
    ja: `Goalaxify ブースへようこそ！${context.homeTeam} 対 ${context.awayTeam}、${context.round}。${kickoffHint} 誰が勝つと思いますか？SOL または USDC はいくら賭けますか？`,
    ko: `Goalaxify 부스에 오신 것을 환영합니다! ${context.homeTeam} vs ${context.awayTeam}, ${context.round}.${kickoffHint} 누가 이길까요? SOL 또는 USDC를 얼마나 걸까요?`,
    ar: `مرحباً بك في كشك Goalaxify! ${context.homeTeam} مقابل ${context.awayTeam}، ${context.round}.${kickoffHint} من يفوز، وكم SOL أو USDC تريد أن تراهن؟`,
  };

  return localized[language];
}
