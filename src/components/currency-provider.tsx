"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Настоящий курс валют.
 *
 * Раньше курсы были вписаны в код: «$1 = 12 740 сум» навсегда. Курс живой,
 * он меняется каждый день, и турист по замороженному числу неверно
 * посчитает, сколько снять в банкомате.
 *
 * Данные берутся у open.er-api.com — бесплатно, без ключа и без платёжной
 * карты, и в списке есть узбекский сум. Оттуда приходят курсы всех
 * основных валют мира к доллару; из них считается любая пара, в том числе
 * к суму.
 *
 * Курс обновляется этой службой раз в сутки, поэтому держим его в памяти
 * и перезапрашиваем при возврате на вкладку. Служба недоступна — отдаём
 * пустую карту, и конвертер честно говорит, что курс сейчас не получить,
 * вместо выдуманного числа.
 */

interface Контекст {
  /** Сколько единиц валюты за один доллар. USD = 1. */
  rates: Record<string, number>;
  loading: boolean;
  /** Когда курс получен, чтобы показать дату. */
  updated: Date | null;
}

const CurrencyContext = createContext<Контекст>({ rates: {}, loading: true, updated: null });

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let живо = true;

    async function обновить() {
      try {
        const r = await fetch("https://open.er-api.com/v6/latest/USD", {
          signal: AbortSignal.timeout(8000),
        });
        if (!r.ok) return;
        const d = await r.json();
        if (!живо || !d?.rates) return;
        setRates(d.rates as Record<string, number>);
        setUpdated(d.time_last_update_unix ? new Date(d.time_last_update_unix * 1000) : new Date());
      } catch {
        // Молчим: прежний курс на экране лучше внезапного прочерка.
      } finally {
        if (живо) setLoading(false);
      }
    }

    обновить();

    // Раз в сутки источник обновляется; проверяем при возврате на вкладку.
    function приВозврате() {
      if (document.visibilityState === "visible") обновить();
    }
    document.addEventListener("visibilitychange", приВозврате);

    return () => {
      живо = false;
      document.removeEventListener("visibilitychange", приВозврате);
    };
  }, []);

  return (
    <CurrencyContext.Provider value={{ rates, loading, updated }}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

/** Знаки самых частых валют; для остальных показываем код. */
export const СИМВОЛЫ: Record<string, string> = {
  USD: "$", EUR: "€", RUB: "₽", GBP: "£", KRW: "₩", CNY: "¥", JPY: "¥",
  UZS: "so'm", TRY: "₺", AED: "د.إ", SAR: "﷼", INR: "₹", KZT: "₸",
  KGS: "с", TJS: "SM", CHF: "Fr", CAD: "$", AUD: "$", PLN: "zł",
};

/**
 * Валюты, которые показываем в первую очередь: доллар, евро и деньги
 * стран, откуда чаще всего едут гости, плюс сам сум. Остальные — следом,
 * по алфавиту, чтобы «все валюты» действительно были все.
 */
export const ГЛАВНЫЕ = ["USD", "EUR", "UZS", "RUB", "KZT", "KGS", "CNY", "KRW", "TRY", "AED", "GBP", "JPY", "INR", "SAR"];
