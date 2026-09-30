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

export type ВидТочки = "place" | "hotel" | "restaurant";

export interface ТочкаМаршрута {
  id: string;
  /** Что это: место (по умолчанию — так сохранены старые маршруты), отель, ресторан. */
  kind?: ВидТочки;
  /** День поездки, с 1. Нет — первый день. */
  day?: number;
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
export function переключитьВМаршруте(т: Omit<ТочкаМаршрута, "addedAt" | "day">): boolean {
  if (typeof localStorage === "undefined") return false;
  const текущий = прочитать();
  const вид = т.kind ?? "place";
  const тот = (x: ТочкаМаршрута) => x.id === т.id && (x.kind ?? "place") === вид;
  const есть = текущий.some(тот);
  // Новое — в последний день плана: обычно человек дособирает его конец.
  const последний = Math.max(1, ...текущий.map(деньТочки));
  записать(
    есть
      ? текущий.filter((x) => !тот(x))
      : [...текущий, { ...т, kind: вид, day: последний, addedAt: new Date().toISOString() }],
  );
  return !есть;
}

export const деньТочки = (т: ТочкаМаршрута) => (т.day && т.day > 0 ? т.day : 1);
const ключТочки = (т: Pick<ТочкаМаршрута, "id" | "kind">) => `${т.kind ?? "place"}:${т.id}`;

/** Перенести точку в другой день — в конец его списка. */
export function задатьДень(ключ: string, день: number) {
  if (typeof localStorage === "undefined") return;
  const текущий = прочитать();
  const т = текущий.find((x) => ключТочки(x) === ключ);
  if (!т) return;
  записать([...текущий.filter((x) => x !== т), { ...т, day: Math.max(1, Math.round(день)) }]);
}

/** Поднять или опустить точку внутри её дня. */
export function сдвинуть(ключ: string, куда: -1 | 1) {
  if (typeof localStorage === "undefined") return;
  const список = [...прочитать()];
  const i = список.findIndex((x) => ключТочки(x) === ключ);
  if (i < 0) return;
  const день = деньТочки(список[i]);
  // Ищем соседа того же дня в нужную сторону.
  for (let j = i + куда; j >= 0 && j < список.length; j += куда) {
    if (деньТочки(список[j]) !== день) continue;
    [список[i], список[j]] = [список[j], список[i]];
    записать(список);
    return;
  }
}

/** Дни плана по порядку, без пустых промежутков: 1, 2, 4 → 1, 2, 3. */
export function поДням(список: ТочкаМаршрута[]): ТочкаМаршрута[][] {
  const дни = [...new Set(список.map(деньТочки))].sort((a, b) => a - b);
  return дни.map((д) => список.filter((т) => деньТочки(т) === д));
}

/*
 * Маршрут можно отправить другу ссылкой «/?trip=…». В ссылке только
 * виды, id и дни — названия и фото получатель берёт из своего приложения.
 */
const БУКВА: Record<ВидТочки, string> = { place: "p", hotel: "h", restaurant: "r" };
const ВИД: Record<string, ВидТочки> = { p: "place", h: "hotel", r: "restaurant" };

export function кодМаршрута(список: ТочкаМаршрута[]): string {
  return список.map((т) => `${БУКВА[т.kind ?? "place"]}.${деньТочки(т)}.${т.id}`).join("~");
}

export function разобратьКод(код: string): { kind: ВидТочки; id: string; day: number }[] {
  return код
    .split("~")
    .slice(0, 60)
    .flatMap((часть) => {
      const м = /^([phr])\.(\d{1,2})\.(.{1,80})$/.exec(часть);
      return м ? [{ kind: ВИД[м[1]], day: Number(м[2]) || 1, id: м[3] }] : [];
    });
}

/** Заменить маршрут целиком — для присланного по ссылке. */
export function заменитьМаршрут(список: Omit<ТочкаМаршрута, "addedAt">[]) {
  if (typeof localStorage === "undefined") return;
  const сейчас = new Date().toISOString();
  записать(список.map((т) => ({ ...т, addedAt: сейчас })));
}

/** Текущий план — для решений вне React (например, «заменить?»). */
export const текущийМаршрут = () => прочитать();

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
