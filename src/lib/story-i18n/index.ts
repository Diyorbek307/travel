import type { Locale } from "../i18n";
import { РАССКАЗЫ_DE } from "./de";
import { РАССКАЗЫ_FR } from "./fr";
import { РАССКАЗЫ_TR } from "./tr";
import { РАССКАЗЫ_ZH } from "./zh";
import { РАССКАЗЫ_KO } from "./ko";
import { РАССКАЗЫ_JA } from "./ja";
import { РАССКАЗЫ_AR } from "./ar";

/**
 * Подробные рассказы о местах Самарканда на остальных языках (кроме en и
 * uz — они в content-i18n-samarkand-story.ts). Файл на язык: id места →
 * переводы разделов по порядку русского рассказа.
 */
export const РАССКАЗЫ_ПО_ЯЗЫКАМ: Partial<Record<Locale, Record<string, string[]>>> = {
  de: РАССКАЗЫ_DE,
  fr: РАССКАЗЫ_FR,
  tr: РАССКАЗЫ_TR,
  zh: РАССКАЗЫ_ZH,
  ko: РАССКАЗЫ_KO,
  ja: РАССКАЗЫ_JA,
  ar: РАССКАЗЫ_AR,
};

/** Заголовки разделов на этих языках. */
export const ЗАГОЛОВКИ_ПО_ЯЗЫКАМ: Record<string, Partial<Record<Locale, string>>> = {
  "Архитектура и убранство": {
    de: "Architektur und Schmuck",
    fr: "Architecture et décor",
    tr: "Mimari ve süsleme",
    zh: "建筑与装饰",
    ko: "건축과 장식",
    ja: "建築と装飾",
    ar: "العمارة والزخرفة",
  },
  "Что посмотреть": {
    de: "Sehenswertes",
    fr: "À voir",
    tr: "Görülecekler",
    zh: "看点",
    ko: "볼거리",
    ja: "見どころ",
    ar: "ما يستحق المشاهدة",
  },
  "Легенды и предания": {
    de: "Legenden und Sagen",
    fr: "Légendes et récits",
    tr: "Efsaneler ve rivayetler",
    zh: "传说与故事",
    ko: "전설과 이야기",
    ja: "伝説と言い伝え",
    ar: "الأساطير والحكايات",
  },
  "Интересные факты": {
    de: "Wissenswertes",
    fr: "Le saviez-vous",
    tr: "İlginç bilgiler",
    zh: "趣闻",
    ko: "흥미로운 사실",
    ja: "豆知識",
    ar: "حقائق طريفة",
  },
  Советы: {
    de: "Tipps",
    fr: "Conseils",
    tr: "İpuçları",
    zh: "建议",
    ko: "팁",
    ja: "コツ",
    ar: "نصائح",
  },
};
