"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  LOCALE_META,
  переведи,
  языкУстройства,
  type Locale,
  type TKey,
} from "@/lib/i18n";
import { переведиКонтент } from "@/lib/content-i18n";

/**
 * Язык интерфейса для всего приложения.
 *
 * Выбор запоминается на устройстве: человек однажды поставил свой язык, и
 * при каждом заходе спрашивать заново — неуважение к его времени. Если
 * выбора ещё не было, берётся язык системы телефона.
 *
 * Для арабского на корне документа выставляется направление справа
 * налево. Без этого арабский текст читается наоборот и ломает разметку —
 * это не косметика, а условие того, что арабский вообще можно прочесть.
 */

const КЛЮЧ = "uzup.lang";

interface Контекст {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: TKey) => string;
  /** Перевод строки содержимого (категории, города, теги). */
  трК: (текст: string) => string;
  dir: "ltr" | "rtl";
}

const ЯзыкContext = createContext<Контекст | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  // На сервере языка устройства нет; чтобы разметка сервера и первого
  // кадра совпала, стартуем с английского и уточняем язык после монтажа.
  const [lang, setLangState] = useState<Locale>("en");

  useEffect(() => {
    let выбор: Locale | null = null;
    try {
      const сохранён = localStorage.getItem(КЛЮЧ);
      if (сохранён && сохранён in LOCALE_META) выбор = сохранён as Locale;
    } catch {
      // Приватный режим прячет localStorage — тогда просто язык системы.
    }
    setLangState(выбор ?? языкУстройства());
  }, []);

  useEffect(() => {
    const dir = LOCALE_META[lang].dir;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);
  }, [lang]);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    try {
      localStorage.setItem(КЛЮЧ, l);
    } catch {
      // Не сохранилось — не беда, в этой сессии язык всё равно сменится.
    }
  }, []);

  const значение = useMemo<Контекст>(
    () => ({
      lang,
      setLang,
      t: (key: TKey) => переведи(key, lang),
      трК: (текст: string) => переведиКонтент(текст, lang),
      dir: LOCALE_META[lang].dir,
    }),
    [lang, setLang],
  );

  return <ЯзыкContext.Provider value={значение}>{children}</ЯзыкContext.Provider>;
}

/** Перевод и текущий язык в любом компоненте. */
export function useT(): Контекст {
  const c = useContext(ЯзыкContext);
  if (!c) {
    // Провайдер не обёрнут — отдаём английский, чтобы экран не падал.
    return {
      lang: "en",
      setLang: () => undefined,
      t: (key) => переведи(key, "en"),
      трК: (текст: string) => переведиКонтент(текст, "en"),
      dir: "ltr",
    };
  }
  return c;
}
