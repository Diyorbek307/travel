/**
 * Страны — кодами ISO 3166 (UZ, DE…), названия — от браузера на нужном языке.
 *
 * Раньше страну вписывали от руки, и в аналитике одна Германия была
 * двумя строками: «Germany» и «Deutschland», а Узбекистан — «UZ» и
 * «Узбекистан». Теперь в профиле лежит код, а подпись берётся из
 * Intl.DisplayNames на языке того, кто смотрит.
 */

// prettier-ignore
export const КОДЫ_СТРАН = (
  "AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW"
).split(" ");

const ЯЗЫКИ = ["ru", "en", "uz", "zh", "ko", "de", "fr", "ja", "tr", "ar"];

function имена(язык: string): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames([язык], { type: "region" });
  } catch {
    return null;
  }
}

/** Название страны на языке интерфейса; не код — показываем как есть. */
export function названиеСтраны(значение: string | null | undefined, язык: string): string {
  if (!значение) return "";
  const код = кодСтраны(значение);
  if (!код) return значение;
  return имена(язык)?.of(код) ?? код;
}

/**
 * Код из чего угодно: «UZ», «uz», «Узбекистан», «Uzbekistan», «Deutschland».
 * Не узнали — null: такая запись показывается как была написана.
 */
export function кодСтраны(значение: string | null | undefined): string | null {
  const v = (значение ?? "").trim();
  if (!v) return null;
  const верх = v.toUpperCase();
  if (КОДЫ_СТРАН.includes(верх)) return верх;
  const искомое = v.toLowerCase();
  for (const язык of ЯЗЫКИ) {
    const и = имена(язык);
    if (!и) continue;
    for (const код of КОДЫ_СТРАН) if (и.of(код)?.toLowerCase() === искомое) return код;
  }
  return null;
}

/** Список для выбора: коды с названиями на языке интерфейса, по алфавиту. */
export function списокСтран(язык: string): { код: string; имя: string }[] {
  const и = имена(язык);
  return КОДЫ_СТРАН
    .map((код) => ({ код, имя: и?.of(код) ?? код }))
    .sort((a, b) => a.имя.localeCompare(b.имя, язык));
}
