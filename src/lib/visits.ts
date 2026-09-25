"use client";

import { useSyncExternalStore } from "react";

/**
 * Что человек уже видел — на устройстве, без сервера и ключей.
 *
 * Из этого собираются «Цифровой паспорт» и достижения в профиле:
 *  - города: открыл место, отель или ресторан города — город посещён;
 *  - места: открыл карточку места — штамп этого места;
 *  - аудиогиды: включил запись — она засчитана.
 *
 * Хранится как { ключ: датаПервогоРаза(ISO) }: дата фиксируется один раз.
 * Города — русские ключи из данных, места — их id.
 */

type Отметки = Record<string, string>;
const ПУСТО: Отметки = {};

/** Хранилище одного вида отметок в localStorage с подпиской для React. */
function отметки(ключ: string) {
  const прочитать = (): Отметки => {
    if (typeof localStorage === "undefined") return ПУСТО;
    try {
      return JSON.parse(localStorage.getItem(ключ) || "{}") as Отметки;
    } catch {
      return ПУСТО;
    }
  };

  let снимок: Отметки = прочитать();
  const подписчики = new Set<() => void>();

  return {
    /** Отметить впервые. Уже отмечено — дату не трогаем. */
    отметить(что: string | undefined | null) {
      if (!что || typeof localStorage === "undefined") return;
      const v = прочитать();
      if (v[что]) return;
      v[что] = new Date().toISOString();
      try {
        localStorage.setItem(ключ, JSON.stringify(v));
      } catch {
        // Хранилище переполнено или закрыто — отметка просто не сохранится.
      }
      снимок = v; // новая ссылка → подписчики перерисуются
      подписчики.forEach((f) => f());
    },
    use(): Отметки {
      return useSyncExternalStore(
        (cb) => {
          подписчики.add(cb);
          return () => подписчики.delete(cb);
        },
        () => снимок,
        () => ПУСТО,
      );
    },
  };
}

const города = отметки("uzup.visits");
const места = отметки("uzup.opened");
const аудио = отметки("uzup.listened");

export const отметитьВизит = города.отметить;
export const useVisits = () => города.use();

export const отметитьМесто = места.отметить;
export const useOpenedPlaces = () => места.use();

export const отметитьПрослушанное = аудио.отметить;
export const useListened = () => аудио.use();
