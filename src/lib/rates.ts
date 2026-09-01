/**
 * Курсы валют к суму.
 *
 * Источник — открытый API Центрального банка Узбекистана. Это принципиально:
 * в макете курс был вписан в код («$1 = 12 740 сум») и уже разошёлся с
 * действительностью, а турист по такой цифре считает деньги в обменнике.
 *
 * Ответ кэшируется на сутки: ЦБ публикует курс раз в день, чаще спрашивать
 * незачем. Ошибка и таймаут не роняют страницу — конвертер просто не
 * показывается, как и погода без ответа сервиса.
 */

const ENDPOINT = "https://cbu.uz/ru/arkhiv-kursov-valyut/json/";
const CACHE_SECONDS = 60 * 60 * 24;
const TIMEOUT_MS = 3000;

/** Валюты, которые показываем: доллар, евро, рубль. */
const SHOWN = ["USD", "EUR", "RUB"] as const;
export type RateCode = (typeof SHOWN)[number];

export interface Rate {
  code: RateCode;
  /** Сколько сумов за одну единицу валюты. */
  perUnit: number;
  /** Дата, на которую ЦБ опубликовал курс, как есть — «28.08.2026». */
  date: string;
}

interface CbuRow {
  Ccy?: string;
  Rate?: string;
  Nominal?: string;
  Date?: string;
}

export async function getRates(): Promise<Rate[]> {
  try {
    const response = await fetch(ENDPOINT, {
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return [];

    const rows = (await response.json()) as CbuRow[];
    if (!Array.isArray(rows)) return [];

    const out: Rate[] = [];
    for (const code of SHOWN) {
      const row = rows.find((r) => r.Ccy === code);
      const rate = Number(row?.Rate);
      // Номинал бывает не единичным (например, курс за 100 единиц) —
      // делим, иначе конвертер завысит сумму в сто раз.
      const nominal = Number(row?.Nominal) || 1;
      if (!Number.isFinite(rate) || rate <= 0) continue;
      out.push({ code, perUnit: rate / nominal, date: String(row?.Date ?? "") });
    }
    return out;
  } catch {
    return [];
  }
}
