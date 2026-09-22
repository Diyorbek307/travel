"use client";

import { useSettings } from "@/lib/settings";
import { useCurrency, СИМВОЛЫ } from "@/components/currency-provider";

/**
 * Показ цен в валюте, выбранной в настройках.
 *
 * Цены в данных всегда в долларах и строками: «$89», «$5–15», «$8»,
 * «~$26», «Бесплатно». Переключатель валюты раньше только сохранял выбор
 * и нигде не применялся. Здесь мы разбираем долларовую строку, переводим
 * по живому курсу (тому же, что в конвертере) и подставляем знак нужной
 * валюты.
 *
 * Если курса нет (сеть не ответила) или валюта — доллар, отдаём строку
 * как есть: лучше честный доллар, чем цифра, взятая с потолка.
 */

/** У этих валют дробная часть не нужна — суммы крупные. */
const БЕЗ_ДРОБИ = new Set(["UZS", "KRW", "JPY", "KZT", "VND", "IDR"]);

function округлить(n: number, code: string): string {
  if (БЕЗ_ДРОБИ.has(code)) {
    // Округляем до сотен, чтобы «11 802» не выглядело точнее, чем есть.
    const шаг = n >= 1000 ? 100 : n >= 100 ? 10 : 1;
    return Math.round(n / шаг) * шаг + "";
  }
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

export function useДеньги() {
  const { currency } = useSettings();
  const { rates } = useCurrency();

  const знак = СИМВОЛЫ[currency] ?? currency;
  // Знаки-суффиксы (сум) ставим после числа, символы — перед.
  const суффикс = currency === "UZS";
  const курс = currency === "USD" ? 1 : rates[currency];

  /** Одна долларовая величина → строка в выбранной валюте. */
  function одна(usd: number): string {
    const v = округлить(usd * (курс || 1), currency);
    const число = Number(v).toLocaleString();
    return суффикс ? `${число} ${знак}` : `${знак}${число}`;
  }

  /**
   * Готовая ценовая строка из данных → та же строка в выбранной валюте.
   * Понимает «$89», «$5–15», «$5-15», «~$26», «$3–$5», «Бесплатно».
   */
  function цена(строка: string | undefined | null): string {
    if (!строка) return "";
    const s = String(строка).trim();
    // «Бесплатно» / «Free» и прочий текст без цифр — переводим как текст.
    if (!/\d/.test(s)) return s;
    // Курса ещё нет или доллар — не трогаем, только чиним «$3–$5» → «$3–5».
    if (currency === "USD" || !курс) return s;

    const числа = s.match(/\d+(?:[.,]\d+)?/g);
    if (!числа) return s;
    const диапазон = числа.length >= 2 && /[–—-]/.test(s);
    const [a, b] = числа.map((x) => parseFloat(x.replace(",", ".")));
    if (диапазон && b != null) return `${одна(a)}–${одна(b)}`;
    // Приставку «~» («около») сохраняем.
    return (s.startsWith("~") ? "~" : "") + одна(a);
  }

  return { цена, одна, знак, currency };
}
