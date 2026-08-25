import type { Lang } from "./types";

/**
 * Топонимы городов.
 *
 * В базе города названы описательно — «Нукус и Каракалпакстан», «Джизак и
 * Зааминские горы»: так они читаются в списке. Но на карте нужна короткая
 * подпись, а помощнику — слово, которое турист напечатает в вопросе.
 * Поэтому топонимы живут отдельно от названий.
 *
 * Модуль намеренно не знает ни про three.js, ни про базу: его импортируют
 * и трёхмерная карта, и серверный разбор запросов.
 */
export const SHORT_NAME: Record<string, Partial<Record<Lang, string>>> = {
  nukus: { ru: "Нукус", uz: "Nukus", en: "Nukus" },
  khiva: { ru: "Хива", uz: "Xiva", en: "Khiva" },
  bukhara: { ru: "Бухара", uz: "Buxoro", en: "Bukhara" },
  navoi: { ru: "Навои", uz: "Navoiy", en: "Navoi" },
  samarkand: { ru: "Самарканд", uz: "Samarqand", en: "Samarkand" },
  shakhrisabz: { ru: "Шахрисабз", uz: "Shahrisabz", en: "Shakhrisabz" },
  karshi: { ru: "Карши", uz: "Qarshi", en: "Karshi" },
  termez: { ru: "Термез", uz: "Termiz", en: "Termez" },
  jizzakh: { ru: "Джизак", uz: "Jizzax", en: "Jizzakh" },
  gulistan: { ru: "Гулистан", uz: "Guliston", en: "Gulistan" },
  tashkent: { ru: "Ташкент", uz: "Toshkent", en: "Tashkent" },
  fergana: { ru: "Фергана", uz: "Farg'ona", en: "Fergana" },
  namangan: { ru: "Наманган", uz: "Namangan", en: "Namangan" },
  andijan: { ru: "Андижан", uz: "Andijon", en: "Andijan" },
};

/** Окончания, которые меняются при склонении и не несут смысла. */
const TAIL = /[аеёиоуыэюяьйaeiouʼ']+$/;

/**
 * Основа слова для нестрогого сравнения.
 *
 * Турист пишет «в Хиве», «по Бухаре», «Самарканде» — падежи. Точное
 * сравнение здесь бесполезно, а полноценная морфология избыточна:
 * достаточно отбросить хвост из гласных. «Хива» и «Хиве» дают «хив»,
 * «Бухара» и «Бухаре» — «бухар».
 */
export function stem(word: string): string {
  const lower = word.toLowerCase().trim();
  return lower.length >= 4 ? lower.replace(TAIL, "") : lower;
}

/**
 * Ищет город в свободной фразе.
 *
 * Сравниваются основы: и топонима, и каждого значимого слова полного
 * названия — «Ферганская долина» отзывается и на «Фергана», и на «Фергане».
 */
export function findCity(
  text: string,
  cities: { slug: string; name: string }[],
): string | undefined {
  const haystack = text.toLowerCase();

  for (const city of cities) {
    if (haystack.includes(city.slug)) return city.slug;

    const candidates = [
      ...Object.values(SHORT_NAME[city.slug] ?? {}),
      ...city.name.split(/[\s,]+/),
    ];

    for (const candidate of candidates) {
      // Короткие слова («и», «гор») дают ложные совпадения.
      if (candidate.length < 4) continue;
      if (haystack.includes(stem(candidate))) return city.slug;
    }
  }

  return undefined;
}
