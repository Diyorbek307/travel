"use client";

import { useSyncExternalStore } from "react";

/**
 * Настройки приложения — на устройстве (localStorage), переживают перезапуск.
 *
 * Тема применяется к <html data-theme>, остальное просто сохраняется и
 * отражается в интерфейсе. По умолчанию — светлая тема.
 */

export interface Настройки {
  /** «system» — слушаем настройку телефона; иначе ручной выбор. */
  theme: "system" | "light" | "dark";
  autoplay: boolean; // автозапуск аудиогида при открытии места
  gps: boolean; // GPS-аудиогид у объектов
  offline: boolean; // офлайн-карты
  units: "metric" | "imperial";
  mapStyle: "standard" | "sat";
  notifNear: boolean;
  notifEvents: boolean;
  notifNew: boolean;
  notifNews: boolean;
}

const ПОУМОЛЧАНИЮ: Настройки = {
  theme: "system",
  autoplay: false,
  gps: true,
  offline: true,
  units: "metric",
  mapStyle: "standard",
  notifNear: true,
  notifEvents: false,
  notifNew: true,
  notifNews: true,
};

const КЛЮЧ = "uzup.settings";

function прочитать(): Настройки {
  if (typeof localStorage === "undefined") return ПОУМОЛЧАНИЮ;
  try {
    return { ...ПОУМОЛЧАНИЮ, ...JSON.parse(localStorage.getItem(КЛЮЧ) || "{}") };
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
  const s: Настройки = { ...прочитать(), [k]: v };
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
