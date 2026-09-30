"use client";

import { useEffect, useState } from "react";
import { useSettings, type Настройки } from "./settings";

/**
 * Лёгкий режим: без тяжёлых фоновых видео.
 *
 * Турист часто сидит на роуминге или слабом 3G в горах, а ролики в шапках
 * весят по 2–3 МБ. «Авто» включает режим сам, когда телефон просит
 * экономить трафик (Save-Data) или сеть медленная; в настройках его можно
 * включить или выключить насовсем. Фото остаются — пропадают только ролики.
 */

type СетьБраузера = { saveData?: boolean; effectiveType?: string };

function сеть(): (СетьБраузера & EventTarget) | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: СетьБраузера & EventTarget }).connection;
}

/** Медленная сеть или телефон просит беречь трафик. */
function сетьПросит(): boolean {
  const с = сеть();
  return Boolean(с?.saveData) || ["slow-2g", "2g", "3g"].includes(с?.effectiveType ?? "");
}

export function лёгкийПоНастройке(режим: Настройки["saveData"]): boolean {
  if (режим === "on") return true;
  if (режим === "off") return false;
  return сетьПросит();
}

/** Для решений до первой отрисовки (выбор заставки). */
export function лёгкийСейчас(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    const с = JSON.parse(localStorage.getItem("uzup.settings") || "{}") as Partial<Настройки>;
    return лёгкийПоНастройке(с.saveData ?? "auto");
  } catch {
    return сетьПросит();
  }
}

export function useЛёгкийРежим(): boolean {
  const { saveData } = useSettings();
  // На сервере сети не видно — стартуем «не лёгким», уточняем после монтажа.
  const [лёгкий, setЛёгкий] = useState(false);
  useEffect(() => {
    const обновить = () => setЛёгкий(лёгкийПоНастройке(saveData));
    обновить();
    const с = сеть();
    с?.addEventListener?.("change", обновить);
    return () => с?.removeEventListener?.("change", обновить);
  }, [saveData]);
  return лёгкий;
}
