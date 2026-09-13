"use client";

import { useSyncExternalStore } from "react";

/**
 * Отметки о посещённых городах — на устройстве, без сервера и ключей.
 *
 * «Цифровой паспорт» собирает штампы по-настоящему: открыл место/отель/
 * ресторан города — получил штамп этого города с датой. Храним в
 * localStorage как { город: датаПервогоВизита(ISO) }. Города — русские
 * ключи из данных (как и у STAMPS), поэтому совпадают напрямую.
 */

const КЛЮЧ = "uzup.visits";
type Визиты = Record<string, string>;

const ПУСТО: Визиты = {};

function прочитать(): Визиты {
  if (typeof localStorage === "undefined") return ПУСТО;
  try {
    return JSON.parse(localStorage.getItem(КЛЮЧ) || "{}") as Визиты;
  } catch {
    return ПУСТО;
  }
}

let снимок: Визиты = прочитать();
const подписчики = new Set<() => void>();

/** Отметить город посещённым (только первый раз — дата фиксируется). */
export function отметитьВизит(город: string | undefined | null): void {
  if (!город || typeof localStorage === "undefined") return;
  const v = прочитать();
  if (v[город]) return; // уже отмечен — дату не трогаем
  v[город] = new Date().toISOString();
  localStorage.setItem(КЛЮЧ, JSON.stringify(v));
  снимок = v; // новая ссылка → подписчики перерисуются
  подписчики.forEach((f) => f());
}

/** Реактивная карта визитов { город: датаISO }. */
export function useVisits(): Визиты {
  return useSyncExternalStore(
    (cb) => {
      подписчики.add(cb);
      return () => подписчики.delete(cb);
    },
    () => снимок,
    () => ПУСТО,
  );
}
