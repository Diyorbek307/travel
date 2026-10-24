import type { Fact, Geo, Place } from "@/lib/types";

/**
 * Места регионов Узбекистана (кроме Самарканда) — из каталога владельца
 * «HelloUZ_all_regions_except_Samarkand.pdf» (октябрь 2026).
 *
 * Как собрано — так же, как Самарканд (data/samarkand.ts):
 * - Каждое место сверено с Wikidata и OpenStreetMap: координаты в каталоге
 *   были ориентировочными (у части — «проверить»), здесь — точка объекта.
 *   Места, которые не удалось подтвердить ни по одному источнику, не взяты.
 * - Описания написаны заново и дополнены фактами из Википедии и
 *   официальных туристических источников; ничего не выдумано — даты,
 *   цены и часы только там, где они подтверждены.
 * - Фото — только свободные снимки Wikimedia Commons, авторы в credits.
 *   Обложка лежит у нас (public/places/<регион>), галерея — миниатюры
 *   Commons: так репозиторий не раздувается на сотни мегабайт.
 * - Рейтинга и отзывов нет (0) — приложение покажет «Новое».
 */

export interface Перевод {
  name: string;
  desc: string;
  type?: string;
}

export interface ЗаписьРегиона {
  /** Устойчивый id: префикс региона и латиница, например bx-poikalon. */
  id: string;
  name: string;
  city: string;
  type: string;
  geo: Geo;
  /** Район или город, если место вне города-«столицы» раздела. */
  district?: string;
  entry?: string;
  hours?: string;
  /** Сколько закладывать на осмотр. */
  время: string;
  /** Действующее религиозное место — дресс-код. */
  свято?: boolean;
  /** Горы, пустыня, дальняя дорога — совет про дорогу и воду. */
  далеко?: boolean;
  phone?: string;
  site?: string;
  desc: string;
  en: Перевод;
  uz: Перевод;
  wikidata?: string;
}

export interface ФотоМеста {
  img: string;
  imgs: string[];
  credits: string;
  sources: string[];
}

export const ДРЕСС_КОД = "Плечи и колени закрыты, женщинам — платок";
export const ДОРОГА = "Дорога и погода — уточняйте заранее; возьмите воду";

function факты(з: ЗаписьРегиона): Fact[] {
  const f = (n: number, label: string, value: string): Fact => ({ id: `${з.id}-f${n}`, label, value });
  return [
    f(1, "Время на осмотр", з.время),
    ...(з.district ? [f(2, "Район", з.district)] : []),
    ...(з.свято ? [f(3, "Дресс-код", ДРЕСС_КОД)] : []),
    ...(з.далеко ? [f(4, "Дорога", ДОРОГА)] : []),
    ...(з.phone ? [f(5, "Телефон", з.phone)] : []),
    ...(з.site ? [f(6, "Сайт", з.site)] : []),
  ];
}

const РАДИУС = 6371;
function км(a: Geo, b: Geo): number {
  const r = Math.PI / 180;
  const x =
    Math.sin(((b.lat - a.lat) * r) / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return 2 * РАДИУС * Math.asin(Math.sqrt(x));
}

/** Запись → место в формате семян. центр — главная точка города раздела. */
export function собрать(з: ЗаписьРегиона, центр: Geo | undefined, фото: ФотоМеста | undefined): Place & { geo: Geo } {
  const расстояние = центр ? км(центр, з.geo) : null;
  return {
    id: з.id,
    name: з.name,
    city: з.city,
    type: з.type,
    geo: з.geo,
    distance: расстояние == null ? "" : расстояние < 10 ? `${расстояние.toFixed(1)} км` : `${Math.round(расстояние)} км`,
    entry: з.entry || "Уточняйте",
    hours: з.hours || "Уточняйте",
    rating: 0,
    reviews: 0,
    audio: false,
    qr: false,
    img: фото?.img ?? "/places/samarkand/no-photo.svg",
    imgs: фото?.imgs ?? [],
    credits: фото?.credits,
    desc: з.desc,
    facts: факты(з),
    story: [],
    tickets: [],
  };
}
