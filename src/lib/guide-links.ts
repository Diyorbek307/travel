import type { Content } from "@/lib/types";

const МАКС_КАРТОЧЕК = 4;

/**
 * Отрезаем от ответа строку [[place:…, hotel:…]] и оставляем только
 * ссылки на записи, которые туристу правда видны: модель может ошибиться
 * в id, а пустая карточка хуже никакой.
 */
export function карточкиОтвета(текст: string, c: Content): { текст: string; ссылки: string[] } {
  const видно = (s: string) => s === "active" || s === "seasonal" || s === "upcoming";
  const есть = new Set([
    ...c.places.filter((x) => видно(x.status)).map((x) => `place:${x.id}`),
    ...c.hotels.filter((x) => видно(x.status)).map((x) => `hotel:${x.id}`),
    ...c.restaurants.filter((x) => видно(x.status)).map((x) => `restaurant:${x.id}`),
  ]);
  const ссылки: string[] = [];
  for (const [, внутри] of текст.matchAll(/\[\[([^\]]*)\]\]/g))
    for (const кусок of внутри.split(",")) {
      const с = кусок.trim();
      if (есть.has(с) && !ссылки.includes(с)) ссылки.push(с);
    }
  // Метки, которые модель всё же вставила в текст, туристу ни к чему.
  const чистый = текст
    .replace(/\[\[[^\]]*\]\]/g, "")
    .replace(/\s*\[(place|hotel|restaurant):[^\]\s]+\]/g, "")
    .trim();
  return { текст: чистый, ссылки: ссылки.slice(0, МАКС_КАРТОЧЕК) };
}
