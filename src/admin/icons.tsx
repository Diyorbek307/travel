/**
 * Иконки панели.
 *
 * Раньше в меню стояли символы шрифта: ◉ ◎ ▣ ◈ ⬡. Они повторялись (у
 * «Мест», «Аудиогидов» и «Уведомлений» один и тот же кружок), ничего не
 * говорили о разделе и в разных системах рисовались разным шрифтом —
 * где-то жирно, где-то пусто.
 *
 * Здесь — линейные значки на сетке 24×24 с одной толщиной штриха. Цвет
 * берут из текста (currentColor), поэтому сами подстраиваются под любую
 * тему панели: светлую, тёмную и заданную в визуальном редакторе.
 */

export type ИмяИконки =
  | "dashboard"
  | "sos"
  | "bookings"
  | "chat"
  | "analytics"
  | "destinations"
  | "tours"
  | "hotels"
  | "restaurants"
  | "events"
  | "audio"
  | "cities"
  | "push"
  | "users"
  | "reviews"
  | "ads"
  | "preview"
  | "theme"
  | "staff"
  | "settings"
  | "search"
  | "sun"
  | "moon"
  | "payment"
  | "system"
  | "logout";

/** Содержимое значков: только контуры, заливку и цвет задаёт обёртка. */
const ФИГУРЫ: Record<ИмяИконки, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  sos: (
    <>
      <path d="M12 3 2.5 19.5a1 1 0 0 0 .9 1.5h17.2a1 1 0 0 0 .9-1.5L12 3Z" />
      <path d="M12 9.5v4.5" />
      <path d="M12 17.5h.01" />
    </>
  ),
  bookings: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      <path d="m9 15 2 2 4-4" />
    </>
  ),
  chat: (
    <>
      <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.6A8.5 8.5 0 1 1 21 12Z" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
    </>
  ),
  analytics: (
    <>
      <path d="M3 3v18h18" />
      <path d="M7.5 16v-4M12 16V8M16.5 16v-6" />
    </>
  ),
  destinations: (
    <>
      <path d="M3 21h18M5 21V10M19 21V10M9.5 21V10M14.5 21V10" />
      <path d="M2.5 10 12 3.5 21.5 10Z" />
    </>
  ),
  tours: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  hotels: (
    <>
      <path d="M2.5 19V6M21.5 19v-5.5a3 3 0 0 0-3-3H10v8.5" />
      <path d="M2.5 16h19" />
      <circle cx="6.5" cy="11.5" r="2" />
    </>
  ),
  restaurants: (
    <>
      <path d="M6 2.5v6.5a2 2 0 0 0 2 2 2 2 0 0 0 2-2V2.5M8 11v10.5" />
      <path d="M18 21.5V2.5c-2.5 1-4 3.8-4 7v3.5h4" />
    </>
  ),
  events: (
    <>
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" />
      <path d="m12 7.5 1.3 3.2 3.2 1.3-3.2 1.3L12 16.5l-1.3-3.2L7.5 12l3.2-1.3Z" />
      <path d="m5.6 5.6 1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </>
  ),
  audio: (
    <>
      <path d="M3.5 18v-6a8.5 8.5 0 0 1 17 0v6" />
      <path d="M20.5 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3ZM3.5 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3Z" />
    </>
  ),
  cities: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V8l5-3v16M10 21V10h9v11" />
      <path d="M13 13.5h3M13 17h3" />
    </>
  ),
  push: (
    <>
      <path d="M6 8.5a6 6 0 0 1 12 0c0 6.5 2.5 8.5 2.5 8.5h-17S6 15 6 8.5Z" />
      <path d="M10.3 20.5a1.9 1.9 0 0 0 3.4 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20.5a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.5a6.5 6.5 0 0 1 3 6" />
    </>
  ),
  reviews: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" />,
  ads: (
    <>
      <path d="M3 10.5v3a1.5 1.5 0 0 0 1.5 1.5H7l7.5 4.5V4.5L7 9H4.5A1.5 1.5 0 0 0 3 10.5Z" />
      <path d="M18 9a4 4 0 0 1 0 6M7 15l1.5 5.5" />
    </>
  ),
  preview: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  theme: (
    <>
      <path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 3.5-3.5 3.5h-2a2 2 0 0 0-1.4 3.4A1.3 1.3 0 0 1 12 21Z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10.5" cy="7" r="1" />
      <circle cx="15.5" cy="7.5" r="1" />
    </>
  ),
  staff: (
    <>
      <path d="M12 2.5 4 5.5v6c0 4.5 3.3 8.5 8 10 4.7-1.5 8-5.5 8-10v-6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.5-4.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </>
  ),
  moon: <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />,
  payment: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19M6.5 15h3" />
    </>
  ),
  system: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.5h.01" />
    </>
  ),
  logout: (
    <>
      <path d="M9.5 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4.5" />
      <path d="m16 17 5-5-5-5M21 12H9.5" />
    </>
  ),
};

export function Иконка({
  имя,
  size = 16,
  className,
  style,
}: {
  имя: ИмяИконки;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      {ФИГУРЫ[имя]}
    </svg>
  );
}
