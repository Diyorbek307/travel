"use client";

import { useSyncExternalStore } from "react";

/**
 * Какие уведомления уже прочитаны.
 *
 * Отметка о прочтении жила внутри панели и пропадала вместе с ней, а
 * красная точка на колокольчике вообще ни от чего не зависела: нажал
 * «Прочитать все» — точка осталась. Храним на устройстве, как визиты.
 *
 * Ключ — id уведомления (см. lib/notifications): у ответа поддержки это
 * id сообщения, у заявки — id и статус.
 */

const КЛЮЧ = "uzup.notifs-read";

const ПУСТО: string[] = [];

function прочитать(): string[] {
  if (typeof localStorage === "undefined") return ПУСТО;
  try {
    const v = JSON.parse(localStorage.getItem(КЛЮЧ) || "[]");
    return Array.isArray(v) ? v : ПУСТО;
  } catch {
    return ПУСТО;
  }
}

let снимок: string[] = прочитать();
const подписчики = new Set<() => void>();

function записать(список: string[]) {
  localStorage.setItem(КЛЮЧ, JSON.stringify(список));
  снимок = список;
  подписчики.forEach((f) => f());
}

export function отметитьПрочитанным(ключи: string[]) {
  if (typeof localStorage === "undefined") return;
  const было = прочитать();
  const новые = ключи.filter((k) => !было.includes(k));
  if (новые.length === 0) return;
  записать([...было, ...новые]);
}

export function useПрочитанные(): string[] {
  return useSyncExternalStore(
    (cb) => {
      подписчики.add(cb);
      return () => подписчики.delete(cb);
    },
    () => снимок,
    () => ПУСТО,
  );
}
