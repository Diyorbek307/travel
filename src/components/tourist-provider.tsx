"use client";

import { createContext, useContext } from "react";

/**
 * Кто смотрит приложение — для мест, которым это важно далеко от
 * page.tsx: карточке заведения нужно знать, есть ли у туриста Premium
 * (показать скидку или предложить подключить), и уметь открыть окно Premium.
 */
export interface Турист {
  имя: string;
  isPremium: boolean;
  /** До какого числа действует Premium (ISO) — на экране скидки. */
  premiumUntil: string | null;
  открытьPremium: () => void;
}

const Контекст = createContext<Турист>({
  имя: "",
  isPremium: false,
  premiumUntil: null,
  открытьPremium: () => {},
});

export const ТуристProvider = Контекст.Provider;
export const useТурист = () => useContext(Контекст);
