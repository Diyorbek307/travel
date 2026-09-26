/**
 * Роли и права в админ-панели.
 *
 * Модуль нарочно без обращений к Node и к базе: его читают и сервер
 * (проверка доступа к API), и клиент (какие разделы показывать в меню).
 * Одна таблица прав на обе стороны — иначе меню и настоящая проверка
 * разойдутся, и раздел, спрятанный в меню, всё равно откроется запросом.
 *
 * Ролей три, по группам работы, а не по отдельным галочкам на каждый
 * раздел: так проще держать в голове, кто что может, и труднее случайно
 * выдать лишнее.
 *
 *  - Владелец   — всё, включая учётные записи сотрудников и настройки.
 *  - Редактор   — содержимое: города, места, отели, рестораны, события,
 *                 аудиогиды, туры, направления; плюс превью и тема.
 *  - Поддержка  — операции: SOS, брони, чат, отзывы, пользователи.
 */

export type AdminRole = "owner" | "editor" | "support";

export const ROLE_META: Record<AdminRole, { label: string; desc: string; color: string }> = {
  owner: {
    label: "Владелец",
    desc: "Полный доступ, включая сотрудников и настройки",
    color: "var(--color-amber)",
  },
  editor: {
    label: "Редактор",
    desc: "Содержимое: города, места, отели, рестораны, события, аудиогиды",
    color: "var(--color-teal)",
  },
  support: {
    label: "Поддержка",
    desc: "Операции: SOS, брони, чат, отзывы, пользователи",
    color: "#7a8fff",
  },
};

export const ВСЕ_РОЛИ: AdminRole[] = ["owner", "editor", "support"];

export function рольСуществует(x: string): x is AdminRole {
  return x === "owner" || x === "editor" || x === "support";
}

/**
 * Домены прав — крупные области, которыми защищаются API. Раздел меню
 * может быть узким («Отели»), но за ним стоит домен («content»), и
 * проверять на сервере удобнее домен: их пять, а не тридцать.
 */
export type Домен = "content" | "operations" | "users" | "money" | "staff";

const РОЛЬ_ДОМЕНЫ: Record<AdminRole, Домен[]> = {
  owner: ["content", "operations", "users", "money", "staff"],
  editor: ["content"],
  support: ["operations", "users"],
};

export function можетДомен(role: AdminRole, домен: Домен): boolean {
  return РОЛЬ_ДОМЕНЫ[role].includes(домен);
}

/**
 * Какие разделы меню доступны роли. Ключ — id раздела из `shell.tsx`.
 * Раздела нет в таблице → показываем только владельцу: безопасный
 * умолчание, новый раздел не откроется всем случайно.
 */
const РАЗДЕЛ_ДОСТУП: Record<string, AdminRole[]> = {
  // Все три роли — общий вход и обзор.
  dashboard: ["owner", "editor", "support"],
  preview: ["owner", "editor", "support"],
  settings: ["owner", "editor", "support"],
  // Операции — поддержка.
  sos: ["owner", "support"],
  bookings: ["owner", "support"],
  chat: ["owner", "support"],
  analytics: ["owner", "support"],
  users: ["owner", "support"],
  reviews: ["owner", "support"],
  // Содержимое — редактор.
  destinations: ["owner", "editor"],
  tours: ["owner", "editor"],
  hotels: ["owner", "editor"],
  restaurants: ["owner", "editor"],
  events: ["owner", "editor"],
  audio: ["owner", "editor"],
  cities: ["owner", "editor"],
  theme: ["owner", "editor"],
  // Уведомления туристам — тоже содержимое: пишет редактор.
  push: ["owner", "editor"],
  // Монетизация и сотрудники — владелец.
  ads: ["owner"],
  staff: ["owner"],
};

export function можетРаздел(role: AdminRole, id: string): boolean {
  const список = РАЗДЕЛ_ДОСТУП[id];
  return список ? список.includes(role) : role === "owner";
}
