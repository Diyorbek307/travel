"use client";

import { useSyncExternalStore } from "react";

/**
 * Маршрут поездки — что человек собрал сам.
 *
 * Кнопка «В маршрут» раньше показывала «добавлено» и на этом всё
 * заканчивалось: списка, куда добавлять, не существовало, а «Мои
 * маршруты» в меню открывали общую карту. Теперь это настоящий набор
 * на устройстве, как избранное.
 */

const КЛЮЧ = "uzup.trip";

export interface ТочкаМаршрута {
  id: string;
  name: string;
  city: string;
  img: string;
  /** Когда добавили — по этому порядку и показываем. */
  addedAt: string;
}

const ПУСТО: ТочкаМаршрута[] = [];

function прочитать(): ТочкаМаршрута[] {
  if (typeof localStorage === "undefined") return ПУСТО;
  try {
    const v = JSON.parse(localStorage.getItem(КЛЮЧ) || "[]");
    return Array.isArray(v) ? v : ПУСТО;
  } catch {
    return ПУСТО;
  }
}

let снимок: ТочкаМаршрута[] = прочитать();
const подписчики = new Set<() => void>();

function записать(список: ТочкаМаршрута[]) {
  localStorage.setItem(КЛЮЧ, JSON.stringify(список));
  снимок = список;
  подписчики.forEach((f) => f());
}

/** Добавить или убрать. Возвращает true, если точка теперь в маршруте. */
export function переключитьВМаршруте(т: Omit<ТочкаМаршрута, "addedAt">): boolean {
  if (typeof localStorage === "undefined") return false;
  const текущий = прочитать();
  const есть = текущий.some((x) => x.id === т.id);
  записать(есть ? текущий.filter((x) => x.id !== т.id) : [...текущий, { ...т, addedAt: new Date().toISOString() }]);
  return !есть;
}

export function очиститьМаршрут() {
  if (typeof localStorage === "undefined") return;
  записать([]);
}

export function useTrip(): ТочкаМаршрута[] {
  return useSyncExternalStore(
    (cb) => {
      подписчики.add(cb);
      return () => подписчики.delete(cb);
    },
    () => снимок,
    () => ПУСТО,
  );
}
