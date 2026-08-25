import type { Lang, Poi } from "./types";

/**
 * Ограничитель частоты и кеш ответов помощника.
 *
 * Каждый вопрос к языковой модели — это деньги владельца платформы. Без
 * потолка один скрипт способен за ночь выставить счёт на всю выручку;
 * без кеша тысяча туристов, спросивших «что посмотреть в Самарканде»,
 * оплачиваются тысячу раз, хотя ответ у них один.
 *
 * Хранилище — в памяти процесса. Это осознанный размен: Redis ради двух
 * словарей на одном экземпляре не нужен. Ограничение честное: при
 * нескольких экземплярах счётчики у каждого свои, и потолок фактически
 * умножается на их число. Когда экземпляров станет больше одного, сюда
 * придётся принести общее хранилище.
 */

/* ─────────────────────────── Частота ─────────────────────────── */

/** Столько вопросов с одного адреса в час. Турист столько не задаёт. */
const LIMIT_PER_HOUR = 25;
const HOUR = 60 * 60 * 1000;

const hits = new Map<string, number[]>();

export interface RateVerdict {
  allowed: boolean;
  /** Сколько вопросов осталось в текущем окне. */
  left: number;
  /** Через сколько секунд освободится место, если лимит исчерпан. */
  retryAfter: number;
}

export function checkRate(ip: string): RateVerdict {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < HOUR);

  if (recent.length >= LIMIT_PER_HOUR) {
    hits.set(ip, recent);
    const oldest = recent[0];
    return {
      allowed: false,
      left: 0,
      retryAfter: Math.ceil((HOUR - (now - oldest)) / 1000),
    };
  }

  recent.push(now);
  hits.set(ip, recent);

  // Чистим редко и по чуть-чуть: словарь не должен расти вечно, но и
  // перебирать его на каждом запросе незачем.
  if (hits.size > 500 && Math.random() < 0.02) {
    for (const [key, stamps] of hits) {
      if (stamps.every((at) => now - at >= HOUR)) hits.delete(key);
    }
  }

  return { allowed: true, left: LIMIT_PER_HOUR - recent.length, retryAfter: 0 };
}

/* ─────────────────────────── Кеш ─────────────────────────── */

/** Сутки: содержимое базы за день почти не меняется. */
const TTL = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 400;

export interface CachedAnswer {
  message: string;
  pois: Poi[];
}

const answers = new Map<string, { at: number; value: CachedAnswer }>();

/**
 * Ключ кеша.
 *
 * Вопросы с координатами не кешируются вовсе: «что рядом» у каждого своё,
 * и общий ответ был бы неверным. История тоже делает вопрос личным, поэтому
 * кешируется только первая реплика разговора.
 */
export function cacheKey(
  text: string,
  lang: Lang,
  city: string | undefined,
  personal: boolean,
): string | null {
  if (personal) return null;
  const normalized = text.toLowerCase().replace(/\s+/g, " ").replace(/[?!.]+$/, "").trim();
  if (!normalized) return null;
  return `${lang}|${city ?? ""}|${normalized}`;
}

export function readCache(key: string | null): CachedAnswer | null {
  if (!key) return null;
  const entry = answers.get(key);
  if (!entry) return null;

  if (Date.now() - entry.at > TTL) {
    answers.delete(key);
    return null;
  }
  return entry.value;
}

export function writeCache(key: string | null, value: CachedAnswer): void {
  if (!key || !value.message) return;

  // Простое вытеснение по возрасту: словарь маленький, и порядок вставки
  // в Map сохраняется, поэтому первый ключ — самый старый.
  if (answers.size >= MAX_ENTRIES) {
    const oldest = answers.keys().next().value;
    if (oldest) answers.delete(oldest);
  }
  answers.set(key, { at: Date.now(), value });
}

/** Адрес обратившегося: за прокси Render настоящий приходит в заголовке. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
