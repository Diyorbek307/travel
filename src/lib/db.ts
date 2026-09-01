import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "./schema.js";
import { dbPath } from "./paths.js";
import type {
  AdBanner,
  AdSlot,
  Category,
  City,
  Exhibit,
  Festival,
  Lang,
  OpeningHours,
  Poi,
  Theme,
} from "./types";

/**
 * Слой доступа к данным.
 *
 * Используется node:sqlite — он встроен в Node 24, поэтому не требует нативной
 * сборки и одинаково работает на Windows, Linux и в CI. Переезд на PostgreSQL
 * затрагивает только этот файл: наружу отдаются доменные типы, не строки БД.
 */

const DB_PATH = dbPath();

// Next.js в dev-режиме перезагружает модули — держим одно соединение на процесс.
const globalForDb = globalThis as unknown as { __uzdb?: DatabaseSync };

export function getDb(): DatabaseSync {
  if (globalForDb.__uzdb) return globalForDb.__uzdb;
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  migrate(db);
  globalForDb.__uzdb = db;
  return db;
}

export function migrate(db: DatabaseSync): void {
  db.exec(SCHEMA_SQL);
}

/* ------------------------------------------------------------------ */
/* Помощники                                                          */
/* ------------------------------------------------------------------ */

/** Порядок фолбэка переводов: запрошенный язык → английский → русский. */
function langFallback(lang: Lang): Lang[] {
  const chain: Lang[] = [lang];
  if (lang !== "en") chain.push("en");
  if (lang !== "ru") chain.push("ru");
  return chain;
}

/** SQL-выражение COALESCE по цепочке языков для поля переводов. */
function coalesceTr(table: string, field: string, lang: Lang): string {
  return langFallback(lang)
    .map((l) => `MAX(CASE WHEN ${table}.lang = '${l}' THEN ${table}.${field} END)`)
    .join(", ");
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || value.length === 0) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

type Row = Record<string, unknown>;

function mapPoi(r: Row): Poi {
  return {
    id: Number(r.id),
    city_id: Number(r.city_id),
    city_slug: (r.city_slug as string) ?? undefined,
    slug: String(r.slug),
    category: String(r.category) as Category,
    themes: parseJson<Theme[]>(r.themes, []),
    lat: Number(r.lat),
    lon: Number(r.lon),
    price_uzs: Number(r.price_uzs),
    is_free: Number(r.is_free),
    opening_hours: parseJson<OpeningHours | null>(r.opening_hours, null),
    avg_visit_min: Number(r.avg_visit_min),
    rating: Number(r.rating),
    popularity: Number(r.popularity),
    cover: (r.cover as string) ?? null,
    phone: (r.phone as string) ?? null,
    website: (r.website as string) ?? null,
    is_active: Number(r.is_active),
    name: String(r.name ?? r.slug),
    short_desc: (r.short_desc as string) ?? null,
    full_story: (r.full_story as string) ?? null,
    audio_url: (r.audio_url as string) ?? null,
    audio_duration_sec: r.audio_duration_sec == null ? null : Number(r.audio_duration_sec),
    qr_code: (r.qr_code as string) ?? null,
    sponsored_priority: Number(r.sponsored_priority ?? 0),
  };
}

/* ------------------------------------------------------------------ */
/* Запросы                                                            */
/* ------------------------------------------------------------------ */

export function listCities(lang: Lang): City[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT c.id, c.slug, c.lat, c.lon, c.zoom, c.cover, c.is_active,
              COALESCE(${coalesceTr("t", "name", lang)}, c.slug)  AS name,
              COALESCE(${coalesceTr("t", "description", lang)})   AS description,
              (SELECT COUNT(*) FROM pois p WHERE p.city_id = c.id AND p.is_active = 1) AS poi_count
         FROM cities c
         LEFT JOIN city_translations t ON t.city_id = c.id
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY poi_count DESC, c.slug`,
    )
    .all() as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    slug: String(r.slug),
    lat: Number(r.lat),
    lon: Number(r.lon),
    zoom: Number(r.zoom),
    cover: (r.cover as string) ?? null,
    is_active: Number(r.is_active),
    name: String(r.name),
    description: (r.description as string) ?? null,
  }));
}

export function getCity(slug: string, lang: Lang): City | null {
  return listCities(lang).find((c) => c.slug === slug) ?? null;
}

const POI_SELECT = (lang: Lang) => `
  SELECT p.*, c.slug AS city_slug,
         COALESCE(${coalesceTr("t", "name", lang)}, p.slug)  AS name,
         COALESCE(${coalesceTr("t", "short_desc", lang)})     AS short_desc,
         COALESCE(${coalesceTr("t", "full_story", lang)})     AS full_story,
         MAX(CASE WHEN a.lang = '${lang}' THEN a.url END)          AS audio_url,
         MAX(CASE WHEN a.lang = '${lang}' THEN a.duration_sec END) AS audio_duration_sec,
         (SELECT q.code FROM qr_codes q
           WHERE q.target_type = 'poi' AND q.target_id = p.id LIMIT 1) AS qr_code,
         COALESCE(vd.sponsored_priority, 0) AS sponsored_priority
    FROM pois p
    JOIN cities c            ON c.id = p.city_id
    LEFT JOIN poi_translations t ON t.poi_id = p.id
    LEFT JOIN poi_audio a        ON a.poi_id = p.id
    LEFT JOIN venue_details vd   ON vd.poi_id = p.id
`;

/** Общий порядок сортировки: платное размещение (рестораны/кафе/зоны
 * отдыха) поднимает объект наверх везде, где вызывается listPois —
 * в списке города, в фильтре категории и в поиске ассистента. У всех
 * остальных объектов sponsored_priority = 0, порядок не меняется. */
const POI_ORDER = "ORDER BY sponsored_priority DESC, p.popularity DESC, p.rating DESC";

export function listPois(
  opts: {
    city?: string;
    category?: Category;
    categories?: Category[];
    lang: Lang;
    includeInactive?: boolean;
  },
): Poi[] {
  const db = getDb();
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (!opts.includeInactive) where.push("p.is_active = 1");
  if (opts.city) {
    where.push("c.slug = ?");
    args.push(opts.city);
  }
  if (opts.category) {
    where.push("p.category = ?");
    args.push(opts.category);
  }
  if (opts.categories && opts.categories.length > 0) {
    where.push(`p.category IN (${opts.categories.map(() => "?").join(",")})`);
    args.push(...opts.categories);
  }
  const sql = `${POI_SELECT(opts.lang)}
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    GROUP BY p.id
    ${POI_ORDER}`;
  return (db.prepare(sql).all(...args) as Row[]).map(mapPoi);
}

export function getPoi(slug: string, lang: Lang): Poi | null {
  const db = getDb();
  const row = db
    .prepare(`${POI_SELECT(lang)} WHERE p.slug = ? GROUP BY p.id`)
    .get(slug) as Row | undefined;
  return row ? mapPoi(row) : null;
}

export function getPoiById(id: number, lang: Lang): Poi | null {
  const db = getDb();
  const row = db
    .prepare(`${POI_SELECT(lang)} WHERE p.id = ? GROUP BY p.id`)
    .get(id) as Row | undefined;
  return row ? mapPoi(row) : null;
}

export function getPoiMedia(poiId: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT url, caption, author, license FROM poi_media
        WHERE poi_id = ? ORDER BY sort, id`,
    )
    .all(poiId) as { url: string; caption: string | null; author: string | null; license: string | null }[];
}

export function getMuseumByPoi(poiId: number): { id: number } | null {
  const db = getDb();
  const row = db.prepare(`SELECT id FROM museums WHERE poi_id = ?`).get(poiId) as Row | undefined;
  return row ? { id: Number(row.id) } : null;
}

export function listExhibits(museumId: number, lang: Lang): Exhibit[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT e.*,
              COALESCE(${coalesceTr("t", "name", lang)}, e.number) AS name,
              COALESCE(${coalesceTr("t", "short_desc", lang)})      AS short_desc,
              COALESCE(${coalesceTr("t", "full_story", lang)})      AS full_story,
              MAX(CASE WHEN a.lang = '${lang}' THEN a.url END)          AS audio_url,
              MAX(CASE WHEN a.lang = '${lang}' THEN a.duration_sec END) AS audio_duration_sec,
              (SELECT q.code FROM qr_codes q
                WHERE q.target_type = 'exhibit' AND q.target_id = e.id LIMIT 1) AS qr_code
         FROM exhibits e
         LEFT JOIN exhibit_translations t ON t.exhibit_id = e.id
         LEFT JOIN exhibit_audio a        ON a.exhibit_id = e.id
        WHERE e.museum_id = ?
        GROUP BY e.id
        ORDER BY e.sort, e.id`,
    )
    .all(museumId) as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    museum_id: Number(r.museum_id),
    number: String(r.number),
    period: (r.period as string) ?? null,
    origin: (r.origin as string) ?? null,
    cover: (r.cover as string) ?? null,
    name: String(r.name),
    short_desc: (r.short_desc as string) ?? null,
    full_story: (r.full_story as string) ?? null,
    audio_url: (r.audio_url as string) ?? null,
    audio_duration_sec: r.audio_duration_sec == null ? null : Number(r.audio_duration_sec),
    qr_code: (r.qr_code as string) ?? null,
  }));
}

export function getExhibitById(id: number, lang: Lang): Exhibit | null {
  const db = getDb();
  const row = db.prepare(`SELECT museum_id FROM exhibits WHERE id = ?`).get(id) as Row | undefined;
  if (!row) return null;
  return listExhibits(Number(row.museum_id), lang).find((e) => e.id === id) ?? null;
}

/* ------------------------------------------------------------------ */
/* Маршруты                                                           */
/* ------------------------------------------------------------------ */

export function listTours(lang: Lang, city?: string) {
  const db = getDb();
  const args: string[] = [];
  let where = "WHERE tr.is_active = 1";
  if (city) {
    where += " AND c.slug = ?";
    args.push(city);
  }
  const rows = db
    .prepare(
      `SELECT tr.id, tr.slug, tr.kind, tr.mode, tr.cover, tr.total_min, tr.city_id,
              c.slug AS city_slug,
              COALESCE(${coalesceTr("t", "title", lang)}, tr.slug) AS title,
              COALESCE(${coalesceTr("t", "description", lang)})    AS description,
              (SELECT COUNT(*) FROM tour_stops s WHERE s.tour_id = tr.id) AS stop_count
         FROM tours tr
         JOIN cities c ON c.id = tr.city_id
         LEFT JOIN tour_translations t ON t.tour_id = tr.id
         ${where}
         GROUP BY tr.id
         ORDER BY tr.sort, tr.id`,
    )
    .all(...args) as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    slug: String(r.slug),
    kind: String(r.kind) as "curated" | "generated" | "user",
    mode: String(r.mode) as "walk" | "taxi" | "car",
    cover: (r.cover as string) ?? null,
    total_min: Number(r.total_min),
    city_id: Number(r.city_id),
    city_slug: String(r.city_slug),
    title: String(r.title),
    description: (r.description as string) ?? null,
    stop_count: Number(r.stop_count),
  }));
}

export function getTourStops(tourId: number, lang: Lang): { poi: Poi; stay_min: number }[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT poi_id, stay_min FROM tour_stops WHERE tour_id = ? ORDER BY order_index`,
    )
    .all(tourId) as Row[];
  const out: { poi: Poi; stay_min: number }[] = [];
  for (const r of rows) {
    const poi = getPoiById(Number(r.poi_id), lang);
    if (poi) out.push({ poi, stay_min: Number(r.stay_min) });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* QR и аналитика                                                     */
/* ------------------------------------------------------------------ */

export function resolveQr(code: string): { target_type: string; target_id: number } | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT target_type, target_id FROM qr_codes WHERE code = ?`)
    .get(code.toUpperCase()) as Row | undefined;
  if (!row) return null;
  db.prepare(`UPDATE qr_codes SET scans = scans + 1 WHERE code = ?`).run(code.toUpperCase());
  return { target_type: String(row.target_type), target_id: Number(row.target_id) };
}

export function listQrCodes() {
  const db = getDb();
  return db
    .prepare(
      `SELECT q.code, q.target_type, q.target_id, q.scans,
              COALESCE(pt.name, et.name, '—') AS target_name
         FROM qr_codes q
         LEFT JOIN poi_translations pt
                ON q.target_type = 'poi' AND pt.poi_id = q.target_id AND pt.lang = 'ru'
         LEFT JOIN exhibit_translations et
                ON q.target_type = 'exhibit' AND et.exhibit_id = q.target_id AND et.lang = 'ru'
        ORDER BY q.scans DESC, q.code`,
    )
    .all() as Row[];
}

export function trackEvent(e: {
  type: string;
  city_id?: number | null;
  poi_id?: number | null;
  lang?: string | null;
  session_hash?: string | null;
  meta?: unknown;
}): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO events (type, city_id, poi_id, lang, session_hash, meta)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    e.type,
    e.city_id ?? null,
    e.poi_id ?? null,
    e.lang ?? null,
    e.session_hash ?? null,
    e.meta ? JSON.stringify(e.meta) : null,
  );
}

/**
 * Заявка на столик — обычная запись, не редактирование контента объекта,
 * поэтому живёт здесь же, рядом с trackEvent, а не в admin-db.ts.
 * Валидация полей — на вызывающей стороне (API-роут).
 */
export function createReservation(input: {
  poi_id: number;
  name: string;
  phone: string;
  party_size: number;
  requested_at: string;
  note: string | null;
}): number {
  const db = getDb();
  db.prepare(
    `INSERT INTO reservations (poi_id, name, phone, party_size, requested_at, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(input.poi_id, input.name, input.phone, input.party_size, input.requested_at, input.note);
  return Number((db.prepare(`SELECT last_insert_rowid() AS id`).get() as Row).id);
}

/**
 * Праздники и фестивали, начиная с ближайшего.
 *
 * Порядок «от сегодня по кругу»: ежегодные праздники, что уже прошли в
 * этом году, уезжают в конец списка, а не пропадают — турист, приехавший
 * в апреле, должен видеть, что Навруз будет в марте следующего года,
 * а не пустой раздел.
 */
export function listFestivals(lang: Lang, limit = 8): Festival[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT f.id, f.slug, f.month, f.day, f.year, f.days, f.cover,
              c.slug AS city_slug,
              COALESCE(${coalesceTr("ct", "name", lang)}) AS city_name,
              COALESCE(${coalesceTr("t", "name", lang)}, f.slug) AS name,
              COALESCE(${coalesceTr("t", "description", lang)})  AS description
         FROM festivals f
         LEFT JOIN cities c            ON c.id = f.city_id
         LEFT JOIN city_translations ct ON ct.city_id = c.id
         LEFT JOIN festival_translations t ON t.festival_id = f.id
        WHERE f.is_active = 1
        GROUP BY f.id
        ORDER BY f.sort, f.month, f.day`,
    )
    .all() as Row[];

  const now = new Date();
  const today = (now.getMonth() + 1) * 100 + now.getDate();

  const mapped = rows.map((r) => ({
    id: Number(r.id),
    slug: String(r.slug),
    city_slug: (r.city_slug as string) ?? null,
    city_name: (r.city_name as string) ?? null,
    month: Number(r.month),
    day: r.day == null ? null : Number(r.day),
    year: r.year == null ? null : Number(r.year),
    days: Number(r.days),
    cover: (r.cover as string) ?? null,
    name: String(r.name),
    description: (r.description as string) ?? null,
  }));

  // Ключ сортировки — «сколько дней ждать»: прошедшие в этом году
  // получают +1200 и оказываются позади предстоящих.
  const key = (f: Festival) => {
    const stamp = f.month * 100 + (f.day ?? 1);
    return stamp >= today ? stamp : stamp + 1200;
  };
  return mapped.sort((a, b) => key(a) - key(b)).slice(0, limit);
}

/**
 * Баннер для места показа.
 *
 * Отбирается один, а не список: рекламный блок в макете единственный на
 * экран. Фильтр по датам — открутка идёт только внутри оплаченного
 * периода; NULL с обеих сторон означает «бессрочно». Язык либо совпадает
 * с языком интерфейса, либо у баннера не задан — тогда он общий.
 */
export function pickAdBanner(slot: AdSlot, lang: Lang): AdBanner | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, slot, lang, title, subtitle, cta_label, url, weight, starts_at, ends_at
         FROM ad_banners
        WHERE is_active = 1
          AND slot = ?
          AND (lang IS NULL OR lang = ?)
          AND (starts_at IS NULL OR starts_at <= datetime('now'))
          AND (ends_at   IS NULL OR ends_at   >= datetime('now'))
        ORDER BY weight DESC, id
        LIMIT 1`,
    )
    .get(slot, lang) as Row | undefined;
  if (!row) return null;

  // Показ засчитываем здесь же: отдельный запрос с клиента ради счётчика
  // блокировался бы любым блокировщиком рекламы, и отчёт рекламодателю
  // оказался бы заниженным.
  db.prepare(`UPDATE ad_banners SET impressions = impressions + 1 WHERE id = ?`).run(
    Number(row.id),
  );

  return {
    id: Number(row.id),
    slot: String(row.slot) as AdSlot,
    lang: (row.lang as Lang) ?? null,
    title: String(row.title),
    subtitle: (row.subtitle as string) ?? null,
    cta_label: (row.cta_label as string) ?? null,
    url: String(row.url),
    weight: Number(row.weight),
    starts_at: (row.starts_at as string) ?? null,
    ends_at: (row.ends_at as string) ?? null,
  };
}

export function countAdClick(id: number): void {
  getDb().prepare(`UPDATE ad_banners SET clicks = clicks + 1 WHERE id = ?`).run(id);
}

/** Заявка на подписку: только способ связи, до подключения оплаты. */
export function createProLead(contact: string, lang: Lang): void {
  getDb()
    .prepare(`INSERT INTO pro_leads (contact, lang) VALUES (?, ?)`)
    .run(contact, lang);
}

export function analytics() {
  const db = getDb();
  const q = (sql: string) => db.prepare(sql).all() as Row[];
  return {
    totals: db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM cities WHERE is_active = 1) AS cities,
           (SELECT COUNT(*) FROM pois   WHERE is_active = 1) AS pois,
           (SELECT COUNT(*) FROM tours  WHERE is_active = 1) AS tours,
           (SELECT COUNT(*) FROM qr_codes)                   AS qr_codes,
           (SELECT COUNT(*) FROM exhibits)                   AS exhibits,
           (SELECT COUNT(*) FROM poi_audio)                  AS audio_tracks,
           (SELECT COUNT(*) FROM events)                     AS events`,
      )
      .get() as Row,
    topCities: q(
      `SELECT c.slug, COALESCE(t.name, c.slug) AS name, COUNT(e.id) AS n
         FROM events e
         JOIN cities c ON c.id = e.city_id
         LEFT JOIN city_translations t ON t.city_id = c.id AND t.lang = 'ru'
        GROUP BY c.id ORDER BY n DESC LIMIT 10`,
    ),
    topPois: q(
      `SELECT p.slug, COALESCE(t.name, p.slug) AS name, COUNT(e.id) AS n
         FROM events e
         JOIN pois p ON p.id = e.poi_id
         LEFT JOIN poi_translations t ON t.poi_id = p.id AND t.lang = 'ru'
        GROUP BY p.id ORDER BY n DESC LIMIT 10`,
    ),
    byLang: q(
      `SELECT lang, COUNT(*) AS n FROM events
        WHERE lang IS NOT NULL GROUP BY lang ORDER BY n DESC`,
    ),
    byType: q(`SELECT type, COUNT(*) AS n FROM events GROUP BY type ORDER BY n DESC`),
    topQr: q(`SELECT code, scans FROM qr_codes ORDER BY scans DESC LIMIT 10`),
  };
}

/** Объект-музей по идентификатору музея — нужен для навигации со страницы экспоната. */
export function getMuseumPoi(museumId: number, lang: Lang): Poi | null {
  const db = getDb();
  const row = db.prepare(`SELECT poi_id FROM museums WHERE id = ?`).get(museumId) as Row | undefined;
  return row ? getPoiById(Number(row.poi_id), lang) : null;
}

/** Готовый маршрут по slug вместе с остановками. */
export function getTourBySlug(slug: string, lang: Lang) {
  const tour = listTours(lang).find((x) => x.slug === slug);
  if (!tour) return null;
  return { ...tour, stops: getTourStops(tour.id, lang) };
}

/**
 * Обложки городов и маршрутов.
 *
 * Своих снимков у города нет и быть не может: фотографии мы берём с
 * Викисклада по конкретным памятникам. Поэтому обложкой города служит снимок
 * самого известного объекта внутри него, а обложкой маршрута — первая
 * остановка, у которой снимок есть.
 */
export function cityCovers(): Record<string, string> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT c.slug AS slug,
              (SELECT p.cover FROM pois p
                WHERE p.city_id = c.id AND p.cover IS NOT NULL AND p.is_active = 1
                ORDER BY p.popularity DESC LIMIT 1) AS cover
         FROM cities c`,
    )
    .all() as Row[];

  const out: Record<string, string> = {};
  for (const row of rows) if (row.cover) out[String(row.slug)] = String(row.cover);
  return out;
}

export function tourCovers(): Record<string, string> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT t.slug AS slug,
              (SELECT p.cover FROM tour_stops ts
                 JOIN pois p ON p.id = ts.poi_id
                WHERE ts.tour_id = t.id AND p.cover IS NOT NULL
                ORDER BY ts.order_index LIMIT 1) AS cover
         FROM tours t`,
    )
    .all() as Row[];

  const out: Record<string, string> = {};
  for (const row of rows) if (row.cover) out[String(row.slug)] = String(row.cover);
  return out;
}
