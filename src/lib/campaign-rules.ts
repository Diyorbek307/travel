/**
 * Кампании уведомлений: общие типы и правила.
 *
 * Модуль без Node и без базы: его читают и сервер (кому отдать и кому
 * разослать push), и админка (что показать в форме), и приложение (куда
 * вести по нажатию). Одно правило «кому и когда» на все стороны — иначе
 * колокольчик и push однажды разошлись бы: push пришёл, а в колокольчике
 * пусто.
 */

/** Кому показывать. «Город» — где человек сейчас, по местоположению. */
export type Аудитория = { kind: "all" } | { kind: "premium" } | { kind: "city"; city: string };

export interface Кампания {
  id: string;
  title: string;
  body: string;
  emoji: string;
  /**
   * Куда ведёт нажатие — строка, чтобы её можно было положить и в адрес
   * (?open=…), и в push: «explore», «explore:hotels», «map», «profile»,
   * «place:<id>», «hotel:<id>», «restaurant:<id>». Пусто — никуда.
   */
  link: string;
  audience: Аудитория;
  /** Срок показа включительно, даты «ГГГГ-ММ-ДД» по Ташкенту. */
  from: string;
  to: string;
  /** Выключенная кампания не видна никому, но хранится в панели. */
  active: boolean;
  createdAt: string;
  updatedAt: string;
  /** Когда последний раз рассылали push и скольким он ушёл. */
  pushedAt?: string;
  pushSent?: number;
}

/** Что видит админка: кампания и сколько человек её прочитали. */
export type КампанияСоСчётом = Кампания & { reads: number };

/** Кто смотрит: от этого зависит, какие кампании ему подходят. */
export interface Зритель {
  premium: boolean;
  /** Ближайший город по местоположению; null — неизвестно. */
  city: string | null;
}

/**
 * Сегодняшняя дата по Ташкенту. Срок кампании редактор задаёт в местных
 * датах: «по 30 сентября» значит до полуночи в Узбекистане, а не по
 * времени сервера, который стоит во Франкфурте.
 */
export function сегодняВТашкенте(сейчас: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(сейчас);
}

/** Идёт ли кампания в этот день: включена и день внутри срока. */
export function идётСегодня(к: Кампания, сегодня: string): boolean {
  return к.active && к.from <= сегодня && сегодня <= к.to;
}

/** Подходит ли кампания этому человеку. */
export function подходит(к: Кампания, кто: Зритель): boolean {
  switch (к.audience.kind) {
    case "all":
      return true;
    case "premium":
      return кто.premium;
    case "city":
      return кто.city === к.audience.city;
  }
}

/** Разбор ссылки кампании в то, что умеет открыть приложение. */
export type Переход =
  | { kind: "explore"; раздел?: string }
  | { kind: "map" }
  | { kind: "profile" }
  | { kind: "place" | "hotel" | "restaurant"; id: string };

const РАЗДЕЛЫ = ["cities", "places", "museums", "hotels", "restaurants", "bars", "excursions", "ai"];

export function разобратьСсылку(ссылка: string): Переход | null {
  const [вид, хвост = ""] = ссылка.split(":", 2);
  switch (вид) {
    case "explore":
      return РАЗДЕЛЫ.includes(хвост) ? { kind: "explore", раздел: хвост } : { kind: "explore" };
    case "map":
      return { kind: "map" };
    case "profile":
      return { kind: "profile" };
    case "place":
    case "hotel":
    case "restaurant":
      return хвост ? { kind: вид, id: хвост } : null;
    default:
      return null;
  }
}

/**
 * Проверка кампании, пришедшей из панели. Возвращает текст ошибки для
 * редактора или null. Строже формы: запрос можно прислать и мимо неё.
 */
export function ошибкаКампании(к: Partial<Кампания>): string | null {
  if (!к.title?.trim()) return "Нужен заголовок";
  if (к.title.length > 80) return "Заголовок длиннее 80 знаков";
  if (!к.body?.trim()) return "Нужен текст";
  if (к.body.length > 300) return "Текст длиннее 300 знаков";
  const дата = /^\d{4}-\d{2}-\d{2}$/;
  if (!к.from || !дата.test(к.from) || !к.to || !дата.test(к.to)) return "Нужен срок показа «с — по»";
  if (к.from > к.to) return "Дата «с» позже даты «по»";
  const а = к.audience;
  if (!а || !["all", "premium", "city"].includes(а.kind)) return "Не выбрано, кому показывать";
  if (а.kind === "city" && !а.city) return "Не выбран город";
  if (к.link && !разобратьСсылку(к.link)) return "Ссылка на раздел не распознана";
  return null;
}
