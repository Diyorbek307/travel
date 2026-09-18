"use client";

import { useSyncExternalStore } from "react";

/**
 * Избранное («нравится») — на устройстве, без сервера.
 *
 * Сердечко у места/отеля/ресторана добавляет его в этот список и сохраняет
 * в localStorage, поэтому после перезапуска оно на месте. Храним небольшой
 * снимок (что нужно для карточки в списке избранного), а по клику находим
 * полный объект в контенте по id.
 */

const КЛЮЧ = "uzup.favorites";

export type ВидИзбранного = "place" | "hotel" | "restaurant" | "route";

export interface Избранное {
  key: string; // «kind:id» — уникальный ключ
  id: string;
  kind: ВидИзбранного;
  name: string;
  city: string;
  img: string;
  rating: number;
}

const ПУСТО: Избранное[] = [];

function прочитать(): Избранное[] {
  if (typeof localStorage === "undefined") return ПУСТО;
  try {
    const v = JSON.parse(localStorage.getItem(КЛЮЧ) || "[]");
    return Array.isArray(v) ? (v as Избранное[]) : ПУСТО;
  } catch {
    return ПУСТО;
  }
}

let снимок: Избранное[] = прочитать();
const подписчики = new Set<() => void>();

function записать(список: Избранное[]) {
  localStorage.setItem(КЛЮЧ, JSON.stringify(список));
  снимок = список; // новая ссылка → подписчики перерисуются
  подписчики.forEach((f) => f());
}

/** Добавить/убрать из избранного. Возвращает новое состояние (в избранном?). */
export function переключитьИзбранное(f: Omit<Избранное, "key">): boolean {
  if (typeof localStorage === "undefined") return false;
  const key = `${f.kind}:${f.id}`;
  const список = прочитать();
  const i = список.findIndex((x) => x.key === key);
  if (i >= 0) {
    список.splice(i, 1);
    записать(список);
    return false;
  }
  записать([{ ...f, key }, ...список]);
  return true;
}

/** Реактивный список избранного. */
export function useFavorites(): Избранное[] {
  return useSyncExternalStore(
    (cb) => {
      подписчики.add(cb);
      return () => подписчики.delete(cb);
    },
    () => снимок,
    () => ПУСТО,
  );
}
