import type { Geo } from "@/lib/types";

/**
 * Координаты из того, что сотрудник вставил в поле.
 *
 * Чаще всего это не два числа, а ссылка, скопированная из карт. Понимаем:
 * - «41.3111, 69.2797» и «41.3111 69.2797» (широта, долгота);
 * - Google Maps: …/@41.31,69.27,17z, ?q=41.31,69.27, !3d41.31!4d69.27;
 * - Яндекс Карты: ?ll=69.27,41.31, ?pt=69.27,41.31, whatsthere[point]=69.27,41.31 —
 *   у Яндекса порядок обратный: сначала долгота.
 *
 * null — разобрать не удалось или точка вне Земли.
 */
export function разобратьКоординаты(текст: string): Geo | null {
  let т = текст.trim();
  try {
    т = decodeURIComponent(т);
  } catch {
    // «%» без кода — оставляем как есть.
  }
  if (!т) return null;
  const число = String.raw`(-?\d{1,3}(?:\.\d+)?)`;
  const пара = (a: string, b: string): Geo | null => {
    const lat = Number(a);
    const lon = Number(b);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180)
      return null;
    return { lat: Math.round(lat * 1e6) / 1e6, lon: Math.round(lon * 1e6) / 1e6 };
  };
  let m: RegExpMatchArray | null;

  // Google: точная метка места — !3d<широта>!4d<долгота>.
  if ((m = т.match(new RegExp(`!3d${число}!4d${число}`)))) return пара(m[1], m[2]);
  // Google: центр карты — /@широта,долгота.
  if ((m = т.match(new RegExp(`@${число},${число}`)))) return пара(m[1], m[2]);
  // Google: ?q=широта,долгота или ?query=…
  if ((m = т.match(new RegExp(`[?&](?:q|query|destination)=${число},\\s*${число}`)))) return пара(m[1], m[2]);
  // Яндекс: долгота,широта.
  if ((m = т.match(new RegExp(`(?:pt|ll|whatsthere\\[point\\])=${число},${число}`)))) return пара(m[2], m[1]);
  // Просто два числа: широта и долгота.
  if ((m = т.match(new RegExp(`^${число}\\s*[,;\\s]\\s*${число}$`)))) return пара(m[1], m[2]);
  return null;
}

/** Похоже ли на Узбекистан — иначе, скорее всего, перепутаны широта и долгота. */
export function вУзбекистане(g: Geo): boolean {
  return g.lat >= 37 && g.lat <= 46 && g.lon >= 55.9 && g.lon <= 73.2;
}
