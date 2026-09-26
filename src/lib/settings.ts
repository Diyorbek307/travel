"use client";

import { useSyncExternalStore } from "react";

/**
 * Настройки приложения — на устройстве (localStorage), переживают перезапуск.
 *
 * Тема применяется к <html data-theme>, остальное просто сохраняется и
 * отражается в интерфейсе. По умолчанию тема светлая: фотографии городов
 * и иллюстрации плиток рассчитаны на светлый фон. Тёмную или «как в
 * системе» человек выбирает сам в настройках.
 */

export interface Настройки {
  /** «system» — слушаем настройку телефона; иначе ручной выбор. */
  theme: "system" | "light" | "dark";
  /** Открыл место — его аудиогид начинается сам. */
  autoplay: boolean;
  units: "metric" | "imperial";
  /** Валюта отображения цен. По умолчанию доллар. */
  currency: string;
  /** Интересы из онбординга — по ним на главной первыми идут подходящие места. */
  interests: string[];
  /**
   * Выбирал ли человек тему сам. Раньше настройки сохранялись целиком, с
   * theme: "system" по умолчанию, даже когда меняли только валюту, — по
   * одному значению темы не отличить выбор от умолчания. Без отметки
   * тема светлая.
   */
  themeChosen: boolean;
}

const ПОУМОЛЧАНИЮ: Настройки = {
  theme: "light",
  autoplay: false,
  units: "metric",
  currency: "USD",
  interests: [],
  themeChosen: false,
};

const КЛЮЧ = "uzup.settings";

function прочитать(): Настройки {
  if (typeof localStorage === "undefined") return ПОУМОЛЧАНИЮ;
  try {
    const сохранено: Настройки = { ...ПОУМОЛЧАНИЮ, ...JSON.parse(localStorage.getItem(КЛЮЧ) || "{}") };
    return сохранено.themeChosen ? сохранено : { ...сохранено, theme: "light" };
  } catch {
    return ПОУМОЛЧАНИЮ;
  }
}

let снимок: Настройки = прочитать();
const подписчики = new Set<() => void>();

export function применитьТему(t: "system" | "light" | "dark") {
  if (typeof document === "undefined") return;
  // «Системная» — просто снимаем атрибут: дальше решает prefers-color-scheme
  // в globals.css. Ручной выбор перебивает систему.
  if (t === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
}

export function задатьНастройку<K extends keyof Настройки>(k: K, v: Настройки[K]) {
  if (typeof localStorage === "undefined") return;
  const s: Настройки = { ...прочитать(), [k]: v, ...(k === "theme" ? { themeChosen: true } : {}) };
  localStorage.setItem(КЛЮЧ, JSON.stringify(s));
  снимок = s;
  if (k === "theme") применитьТему(v as "system" | "light" | "dark");
  подписчики.forEach((f) => f());
}

/**
 * Применить сохранённую тему при старте (вызвать один раз на монтировании).
 *
 * Превью в админке открывает приложение с ?preview=dark|light, чтобы
 * показать обе темы, не трогая настройку человека: параметр перебивает
 * сохранённое, но никуда не записывается.
 */
export function инитТему() {
  if (typeof location !== "undefined") {
    const п = new URLSearchParams(location.search).get("preview");
    if (п === "dark" || п === "light") {
      применитьТему(п);
      return;
    }
  }
  применитьТему(прочитать().theme);
}

export function useSettings(): Настройки {
  return useSyncExternalStore(
    (cb) => {
      подписчики.add(cb);
      return () => подписчики.delete(cb);
    },
    () => снимок,
    () => ПОУМОЛЧАНИЮ,
  );
}
