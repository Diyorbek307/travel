import type { Category } from "./types";

/**
 * Контуры иконок как строки разметки.
 *
 * Строки, а не JSX, потому что иконки нужны в двух местах: в React-компонентах
 * и во всплывающих окнах Leaflet, которые принимают только готовый HTML.
 * Один источник вместо двух копий, которые неизбежно разъедутся.
 *
 * Единая сетка 24×24, штрих 1.75, скруглённые концы.
 */

export type IconName =
  | Category
  | "home"
  | "explore"
  | "map"
  | "heart"
  | "user"
  | "search"
  | "bell"
  | "menu"
  | "star"
  | "chevron-right"
  | "arrow-left"
  | "headphones"
  | "qr"
  | "download"
  | "clock"
  | "ticket"
  | "shield"
  | "sparkle"
  | "sos"
  /* Погода: коды ВМО сводятся к этим шести состояниям. */
  | "sun"
  | "cloud-sun"
  | "cloud"
  | "rain"
  | "snow"
  | "storm"
  | "fog"
  /* Плеер аудиогида: своя пара вместо символов ▶/⏹ — эмодзи рисует шрифт
     системы и на разных платформах выглядит по-разному. */
  | "play"
  | "pause"
  /* Заявка на бронирование столика. */
  | "booking"
  /* Знак приложения и колокол уведомлений — из макета. */
  | "logo"
  | "menu-lines";

export const ICON_PATHS: Record<IconName, string> = {
  /* --- Категории объектов (п. 2.1 ТЗ) --- */
  landmark: '<path d="M12 3 5 8v11h14V8l-7-5Z"/><path d="M9 19v-5a3 3 0 0 1 6 0v5"/>',
  museum:
    '<path d="M3 9 12 4l9 5"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9"/><path d="M3 20h18"/>',
  religious:
    '<path d="M12 3c2.5 2 4 4.2 4 6.5H8C8 7.2 9.5 5 12 3Z"/><path d="M8 9.5V20h8V9.5"/><path d="M4 20V12M20 20v-8"/><path d="M3 20h18"/>',
  nature: '<path d="m3 18 5.5-8 3.5 5 2.5-3.5L21 18Z"/><circle cx="7" cy="7" r="2"/>',
  restaurant:
    '<path d="M6 3v8a2 2 0 0 0 4 0V3"/><path d="M8 11v10"/><path d="M17 3c-1.5 1.5-2 3-2 5s.7 2.5 2 2.5V21"/>',
  cafe:
    '<path d="M4 8h12v5a5 5 0 0 1-10 0V8Z"/><path d="M16 9h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M4 21h14"/>',
  rest_zone:
    '<path d="M12 3v6"/><path d="M4 9h16l-2 4H6L4 9Z"/><path d="M6 13v8M18 13v8"/><path d="M4 21h16"/>',
  hotel:
    '<path d="M3 18V7"/><path d="M3 12h14a4 4 0 0 1 4 4v2"/><path d="M3 18h18"/><circle cx="7.5" cy="9.5" r="1.75"/>',
  bazaar:
    '<path d="M4 8h16l-1 3H5L4 8Z"/><path d="M5.5 11v8h13v-8"/><path d="M4 8 6 4h12l2 4"/>',
  craft: '<path d="M4 10h16v10H4z"/><path d="M4 10 6 5h12l2 5"/><path d="M12 5v15"/>',
  toilet:
    '<path d="M6 4v6a3 3 0 0 0 3 3v7"/><path d="M17 4v16"/><path d="M14 20h6l-3-9-3 9Z"/>',
  station:
    '<rect x="5" y="4" width="14" height="12" rx="3"/><path d="M5 11h14"/><path d="M8 20l2-4M16 20l-2-4"/>',
  airport: '<path d="M3 13.5 21 6l-3.5 8L21 18l-4 1-2.5-3.5L9 18l-1.5-3.5L3 13.5Z"/>',
  transport:
    '<path d="M5 15V8l3-4h8l3 4v7"/><path d="M4 15h16"/><circle cx="8" cy="17.5" r="1.75"/><circle cx="16" cy="17.5" r="1.75"/><path d="M8 8h8"/>',

  /* --- Навигация --- */
  home: '<path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9Z"/>',
  explore: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  map: '<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z"/><path d="M9 4v14M15 6v14"/>',
  heart: '<path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',

  /* --- Интерфейс --- */
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  bell:
    '<path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z"/><path d="M10 18a2 2 0 0 0 4 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h11"/>',
  star: '<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z"/>',
  "chevron-right": '<path d="m9 5 7 7-7 7"/>',
  "arrow-left": '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  headphones:
    '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H5.5A1.5 1.5 0 0 1 4 18.5V14ZM20 14h-3v6h1.5a1.5 1.5 0 0 0 1.5-1.5V14Z"/>',
  qr:
    '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2"/>',
  download: '<path d="M12 4v11"/><path d="m7.5 11 4.5 4.5 4.5-4.5"/><path d="M5 20h14"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  ticket:
    '<path d="M4 8h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V8Z"/><path d="M13 8v10" stroke-dasharray="2 2.5"/>',
  shield: '<path d="M12 3.5 19 6v6c0 4.2-3 7.2-7 8.5-4-1.3-7-4.3-7-8.5V6l7-2.5Z"/><path d="m9 12 2 2 4-4"/>',
  sparkle: '<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z"/>',
  play: '<path d="M8 5.5v13l11-6.5-11-6.5Z"/>',
  pause: '<path d="M7 5h4v14H7ZM13 5h4v14h-4Z"/>',
  /* Знак приложения: восьмиконечная звезда в круге — перенесён из макета. */
  logo:
    '<circle cx="12" cy="12" r="10.5" stroke-width="1.6"/><path d="M12 4l2.3 4.9 5.3.5-3.9 3.7 1.2 5.3L12 15.9 7.1 18.4l1.2-5.3L4.4 9.4l5.3-.5z" stroke-width="1.3"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>',
  "menu-lines": '<path d="M3 6h18"/><path d="M3 12h12"/><path d="M3 18h8"/>',
  booking:
    '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9.5h16"/><path d="M8 3v3M16 3v3"/><path d="m9 14 2 2 4-4"/>',
  sos:
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5"/><circle cx="12" cy="16" r="0.6" fill="currentColor"/>',

  /* --- Погода --- */
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  "cloud-sun":
    '<circle cx="8.5" cy="8" r="3"/><path d="M8.5 2.8v1.4M4.3 4.3l1 1M3.3 8.5h1.4M12.7 4.3l-1 1"/><path d="M9 19h8.5a3 3 0 0 0 .3-6 4.2 4.2 0 0 0-8-1.2A3.4 3.4 0 0 0 9 19Z"/>',
  cloud:
    '<path d="M7.5 19h9.8a3.2 3.2 0 0 0 .3-6.4A4.6 4.6 0 0 0 8.8 11 3.7 3.7 0 0 0 7.5 19Z"/>',
  rain:
    '<path d="M7.5 15.5h9.8a3.2 3.2 0 0 0 .3-6.4A4.6 4.6 0 0 0 8.8 7.5 3.7 3.7 0 0 0 7.5 15.5Z"/><path d="M9 18.5l-.8 2M13 18.5l-.8 2M17 18.5l-.8 2"/>',
  snow:
    '<path d="M7.5 15.5h9.8a3.2 3.2 0 0 0 .3-6.4A4.6 4.6 0 0 0 8.8 7.5 3.7 3.7 0 0 0 7.5 15.5Z"/><path d="M9 19h.01M13 19h.01M17 19h.01M11 21h.01M15 21h.01"/>',
  storm:
    '<path d="M7.5 14.5h9.8a3.2 3.2 0 0 0 .3-6.4A4.6 4.6 0 0 0 8.8 6.5 3.7 3.7 0 0 0 7.5 14.5Z"/><path d="M13 16l-2.5 3.5h3L11 23"/>',
  fog: '<path d="M7.5 13h9.8a3.2 3.2 0 0 0 .3-6.4A4.6 4.6 0 0 0 8.8 5 3.7 3.7 0 0 0 7.5 13Z"/><path d="M5 16.5h14M7 20h10"/>',
};

/** Готовая разметка иконки для мест, где нужен HTML-текст (метки на карте). */
export function iconMarkup(name: IconName, size = 20): string {
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.75" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`
  );
}
