import type { Lang, OpeningHours, TransportMode } from "./types";

/** Расстояние по большому кругу между двумя точками, в метрах. */
export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Скорость передвижения, м/мин.
 * Пешая скорость 4,2 км/ч уже поделена на коэффициент извилистости 1,3 —
 * реальные улицы длиннее прямой линии между точками.
 */
const SPEED_M_PER_MIN: Record<TransportMode, number> = {
  walk: (4200 / 60) / 1.3,
  taxi: (18000 / 60) / 1.35,
  car: (25000 / 60) / 1.35,
};

/** Время в пути между точками, в минутах (округляется вверх). */
export function travelMinutes(
  meters: number,
  mode: TransportMode,
): number {
  const base = meters / SPEED_M_PER_MIN[mode];
  // На такси и машине добавляем время на посадку/парковку.
  const overhead = mode === "walk" ? 0 : 5;
  return Math.max(1, Math.round(base + overhead));
}

/**
 * Единицы измерения по языкам. Локализованы отдельно от словарей интерфейса:
 * их подставляют и серверные ответы ассистента, и клиентские компоненты,
 * а тянуть ради «км» весь словарь незачем.
 */
const UNITS: Partial<Record<Lang, { m: string; km: string; min: string; h: string }>> = {
  ru: { m: "м", km: "км", min: "мин", h: "ч" },
  uz: { m: "m", km: "km", min: "daq", h: "soat" },
  en: { m: "m", km: "km", min: "min", h: "h" },
};

function units(lang: Lang) {
  return UNITS[lang] ?? UNITS.en!;
}

export function formatDistance(meters: number, lang: Lang = "ru"): string {
  const u = units(lang);
  if (meters < 1000) return `${Math.round(meters)} ${u.m}`;
  return `${(meters / 1000).toFixed(1)} ${u.km}`;
}

export function formatDuration(minutes: number, lang: Lang = "ru"): string {
  const u = units(lang);
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} ${u.min}`;
  if (m === 0) return `${h} ${u.h}`;
  return `${h} ${u.h} ${m} ${u.min}`;
}

/** Цена входа словами: «бесплатно» или сумма с названием валюты. */
export function formatPrice(priceUzs: number, lang: Lang = "ru"): string {
  if (priceUzs === 0) {
    return lang === "uz" ? "bepul" : lang === "en" ? "free" : "бесплатно";
  }
  const currency = lang === "uz" ? "so'm" : lang === "en" ? "UZS" : "сум";
  const locale = lang === "en" ? "en-US" : "ru-RU";
  return `${priceUzs.toLocaleString(locale)} ${currency}`;
}

/** "09:00" -> 540 */
export function hhmmToMin(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** 540 -> "09:00" */
export function minToHhmm(min: number): string {
  const norm = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = Math.round(norm % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Открыт ли объект в указанный момент.
 * `atMin` — минуты от полуночи, `day` — день недели (0 = воскресенье).
 * Если расписание не задано — считаем, что объект доступен всегда
 * (так ведут себя площади, улицы, вокзалы).
 */
export function isOpenAt(
  hours: OpeningHours | null,
  atMin: number,
  day: number,
): boolean {
  if (!hours) return true;
  const slot = hours[String(day)];
  if (slot === undefined) return true;
  if (slot === null) return false;
  const open = hhmmToMin(slot.open);
  const close = hhmmToMin(slot.close);
  const t = ((atMin % 1440) + 1440) % 1440;
  return t >= open && t <= close - 10; // нужно хотя бы 10 минут до закрытия
}

/** Человекочитаемое расписание на сегодня. */
export function todayHours(hours: OpeningHours | null, day: number): string | null {
  if (!hours) return null;
  const slot = hours[String(day)];
  if (slot === undefined) return null;
  if (slot === null) return "выходной";
  return `${slot.open} – ${slot.close}`;
}
