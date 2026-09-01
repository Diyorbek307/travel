import { getDb } from "./db";
import type { Category, Lang, OpeningHours, Theme } from "./types";

/**
 * Операции изменения данных для админ-панели (п. 16 ТЗ).
 *
 * Вынесены отдельно от читающего слоя намеренно: страницы туриста импортируют
 * только `db.ts` и физически не могут ничего изменить, даже по ошибке.
 */

type Row = Record<string, unknown>;

/* ------------------------------------------------------------------ */
/* Города                                                             */
/* ------------------------------------------------------------------ */

export function upsertCity(input: {
  slug: string;
  lat: number;
  lon: number;
  zoom: number;
  isActive: boolean;
  translations: Partial<Record<Lang, { name: string; description: string }>>;
}): number {
  const db = getDb();
  db.prepare(
    `INSERT INTO cities (slug, lat, lon, zoom, is_active) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       lat = excluded.lat, lon = excluded.lon,
       zoom = excluded.zoom, is_active = excluded.is_active`,
  ).run(input.slug, input.lat, input.lon, input.zoom, input.isActive ? 1 : 0);

  const id = Number((db.prepare(`SELECT id FROM cities WHERE slug = ?`).get(input.slug) as Row).id);

  for (const [lang, tr] of Object.entries(input.translations)) {
    if (!tr?.name) continue;
    db.prepare(
      `INSERT INTO city_translations (city_id, lang, name, description) VALUES (?, ?, ?, ?)
       ON CONFLICT(city_id, lang) DO UPDATE SET
         name = excluded.name, description = excluded.description`,
    ).run(id, lang, tr.name, tr.description || null);
  }
  return id;
}

export function listCitiesAdmin() {
  const db = getDb();
  return db
    .prepare(
      `SELECT c.id, c.slug, c.lat, c.lon, c.zoom, c.is_active,
              COALESCE(t.name, c.slug) AS name,
              (SELECT COUNT(*) FROM pois p WHERE p.city_id = c.id) AS poi_count,
              (SELECT COUNT(*) FROM tours tr WHERE tr.city_id = c.id) AS tour_count
         FROM cities c
         LEFT JOIN city_translations t ON t.city_id = c.id AND t.lang = 'ru'
        ORDER BY c.slug`,
    )
    .all() as Row[];
}

/* ------------------------------------------------------------------ */
/* Объекты                                                            */
/* ------------------------------------------------------------------ */

/** Категории, для которых имеет смысл платное размещение в топе. */
const VENUE_CATEGORIES: Category[] = ["restaurant", "cafe", "rest_zone"];

export interface PoiInput {
  slug: string;
  citySlug: string;
  category: Category;
  themes: Theme[];
  lat: number;
  lon: number;
  priceUzs: number;
  openingHours: OpeningHours | null;
  avgVisitMin: number;
  rating: number;
  popularity: number;
  phone: string | null;
  website: string | null;
  isActive: boolean;
  /** Только для ресторанов/кафе/зон отдыха — см. VENUE_CATEGORIES. */
  sponsoredPriority: number;
  translations: Partial<Record<Lang, { name: string; shortDesc: string; fullStory: string }>>;
}

export function upsertPoi(input: PoiInput): number {
  const db = getDb();
  const cityRow = db.prepare(`SELECT id FROM cities WHERE slug = ?`).get(input.citySlug) as Row | undefined;
  if (!cityRow) throw new Error(`Город «${input.citySlug}» не найден`);

  db.prepare(
    `INSERT INTO pois
       (city_id, slug, category, themes, lat, lon, price_uzs, is_free,
        opening_hours, avg_visit_min, rating, popularity, phone, website, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       city_id = excluded.city_id, category = excluded.category, themes = excluded.themes,
       lat = excluded.lat, lon = excluded.lon,
       price_uzs = excluded.price_uzs, is_free = excluded.is_free,
       opening_hours = excluded.opening_hours, avg_visit_min = excluded.avg_visit_min,
       rating = excluded.rating, popularity = excluded.popularity,
       phone = excluded.phone, website = excluded.website, is_active = excluded.is_active`,
  ).run(
    Number(cityRow.id),
    input.slug,
    input.category,
    JSON.stringify(input.themes),
    input.lat,
    input.lon,
    input.priceUzs,
    input.priceUzs === 0 ? 1 : 0,
    input.openingHours ? JSON.stringify(input.openingHours) : null,
    input.avgVisitMin,
    input.rating,
    input.popularity,
    input.phone,
    input.website,
    input.isActive ? 1 : 0,
  );

  const id = Number((db.prepare(`SELECT id FROM pois WHERE slug = ?`).get(input.slug) as Row).id);

  for (const [lang, tr] of Object.entries(input.translations)) {
    if (!tr?.name) continue;
    db.prepare(
      `INSERT INTO poi_translations (poi_id, lang, name, short_desc, full_story)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(poi_id, lang) DO UPDATE SET
         name = excluded.name, short_desc = excluded.short_desc, full_story = excluded.full_story`,
    ).run(id, lang, tr.name, tr.shortDesc || null, tr.fullStory || null);
  }

  // Строка в venue_details — только для ресторанов/кафе/зон отдыха:
  // остальным категориям платный приоритет не нужен и не пригождается.
  if (VENUE_CATEGORIES.includes(input.category)) {
    db.prepare(
      `INSERT INTO venue_details (poi_id, sponsored_priority) VALUES (?, ?)
       ON CONFLICT(poi_id) DO UPDATE SET sponsored_priority = excluded.sponsored_priority`,
    ).run(id, input.sponsoredPriority);
  }

  return id;
}

export function setPoiActive(slug: string, active: boolean): void {
  getDb().prepare(`UPDATE pois SET is_active = ? WHERE slug = ?`).run(active ? 1 : 0, slug);
}

export function deletePoi(slug: string): void {
  getDb().prepare(`DELETE FROM pois WHERE slug = ?`).run(slug);
}

/** Объект со всеми переводами — для формы редактирования. */
export function getPoiForEdit(slug: string) {
  const db = getDb();
  const poi = db.prepare(`SELECT p.*, c.slug AS city_slug,
        COALESCE(vd.sponsored_priority, 0) AS sponsored_priority
      FROM pois p
      JOIN cities c ON c.id = p.city_id
      LEFT JOIN venue_details vd ON vd.poi_id = p.id
      WHERE p.slug = ?`).get(slug) as Row | undefined;
  if (!poi) return null;

  const translations = db
    .prepare(`SELECT lang, name, short_desc, full_story FROM poi_translations WHERE poi_id = ?`)
    .all(Number(poi.id)) as Row[];

  const audio = db
    .prepare(`SELECT lang, url, duration_sec, narrator FROM poi_audio WHERE poi_id = ?`)
    .all(Number(poi.id)) as Row[];

  return { poi, translations, audio };
}

export function listPoisAdmin(citySlug?: string) {
  const db = getDb();
  const where = citySlug ? "WHERE c.slug = ?" : "";
  const args = citySlug ? [citySlug] : [];
  return db
    .prepare(
      `SELECT p.id, p.slug, p.category, p.price_uzs, p.avg_visit_min, p.rating,
              p.popularity, p.is_active, c.slug AS city_slug,
              COALESCE(t.name, p.slug) AS name,
              (SELECT COUNT(*) FROM poi_translations x WHERE x.poi_id = p.id) AS lang_count,
              (SELECT COUNT(*) FROM poi_audio a WHERE a.poi_id = p.id)        AS audio_count,
              (SELECT q.code FROM qr_codes q
                WHERE q.target_type = 'poi' AND q.target_id = p.id LIMIT 1)    AS qr_code
         FROM pois p
         JOIN cities c ON c.id = p.city_id
         LEFT JOIN poi_translations t ON t.poi_id = p.id AND t.lang = 'ru'
         ${where}
        ORDER BY c.slug, p.popularity DESC`,
    )
    .all(...args) as Row[];
}

/* ------------------------------------------------------------------ */
/* Аудиогиды                                                          */
/* ------------------------------------------------------------------ */

export function setPoiAudio(
  poiId: number,
  lang: Lang,
  url: string,
  durationSec: number,
  narrator: string | null,
): void {
  getDb()
    .prepare(
      `INSERT INTO poi_audio (poi_id, lang, url, duration_sec, narrator) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(poi_id, lang) DO UPDATE SET
         url = excluded.url, duration_sec = excluded.duration_sec, narrator = excluded.narrator`,
    )
    .run(poiId, lang, url, durationSec, narrator);
}

export function deletePoiAudio(poiId: number, lang: Lang): void {
  getDb().prepare(`DELETE FROM poi_audio WHERE poi_id = ? AND lang = ?`).run(poiId, lang);
}

/** Сводка по озвучке: сколько объектов озвучено на каждом языке. */
export function audioCoverage() {
  const db = getDb();
  return {
    total: Number((db.prepare(`SELECT COUNT(*) AS n FROM pois WHERE is_active = 1`).get() as Row).n),
    byLang: db
      .prepare(`SELECT lang, COUNT(*) AS n FROM poi_audio GROUP BY lang ORDER BY n DESC`)
      .all() as Row[],
    textByLang: db
      .prepare(
        `SELECT lang, COUNT(*) AS n FROM poi_translations
          WHERE full_story IS NOT NULL AND full_story <> ''
          GROUP BY lang ORDER BY n DESC`,
      )
      .all() as Row[],
  };
}

/* ------------------------------------------------------------------ */
/* QR-коды                                                            */
/* ------------------------------------------------------------------ */

export function upsertQr(code: string, targetType: "poi" | "exhibit", targetId: number): void {
  getDb()
    .prepare(
      `INSERT INTO qr_codes (code, target_type, target_id) VALUES (?, ?, ?)
       ON CONFLICT(code) DO UPDATE SET target_type = excluded.target_type, target_id = excluded.target_id`,
    )
    .run(code.toUpperCase(), targetType, targetId);
}

export function deleteQr(code: string): void {
  getDb().prepare(`DELETE FROM qr_codes WHERE code = ?`).run(code.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Маршруты                                                           */
/* ------------------------------------------------------------------ */

export function upsertTour(input: {
  slug: string;
  citySlug: string;
  mode: "walk" | "taxi" | "car";
  sort: number;
  isActive: boolean;
  translations: Partial<Record<Lang, { title: string; description: string }>>;
  stops: { poiSlug: string; stayMin: number }[];
}): number {
  const db = getDb();
  const cityRow = db.prepare(`SELECT id FROM cities WHERE slug = ?`).get(input.citySlug) as Row | undefined;
  if (!cityRow) throw new Error(`Город «${input.citySlug}» не найден`);

  const totalMin = input.stops.reduce((s, x) => s + x.stayMin, 0);

  db.prepare(
    `INSERT INTO tours (slug, city_id, kind, mode, total_min, sort, is_active)
     VALUES (?, ?, 'curated', ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       city_id = excluded.city_id, mode = excluded.mode, total_min = excluded.total_min,
       sort = excluded.sort, is_active = excluded.is_active`,
  ).run(input.slug, Number(cityRow.id), input.mode, totalMin, input.sort, input.isActive ? 1 : 0);

  const id = Number((db.prepare(`SELECT id FROM tours WHERE slug = ?`).get(input.slug) as Row).id);

  for (const [lang, tr] of Object.entries(input.translations)) {
    if (!tr?.title) continue;
    db.prepare(
      `INSERT INTO tour_translations (tour_id, lang, title, description) VALUES (?, ?, ?, ?)
       ON CONFLICT(tour_id, lang) DO UPDATE SET
         title = excluded.title, description = excluded.description`,
    ).run(id, lang, tr.title, tr.description || null);
  }

  db.prepare(`DELETE FROM tour_stops WHERE tour_id = ?`).run(id);
  input.stops.forEach((stop, i) => {
    const poi = db.prepare(`SELECT id FROM pois WHERE slug = ?`).get(stop.poiSlug) as Row | undefined;
    if (!poi) return;
    db.prepare(
      `INSERT INTO tour_stops (tour_id, poi_id, order_index, stay_min) VALUES (?, ?, ?, ?)`,
    ).run(id, Number(poi.id), i, stop.stayMin);
  });

  return id;
}

export function deleteTour(slug: string): void {
  getDb().prepare(`DELETE FROM tours WHERE slug = ?`).run(slug);
}

export function listToursAdmin() {
  const db = getDb();
  return db
    .prepare(
      `SELECT tr.id, tr.slug, tr.mode, tr.total_min, tr.sort, tr.is_active, c.slug AS city_slug,
              COALESCE(t.title, tr.slug) AS title,
              (SELECT COUNT(*) FROM tour_stops s WHERE s.tour_id = tr.id) AS stop_count
         FROM tours tr
         JOIN cities c ON c.id = tr.city_id
         LEFT JOIN tour_translations t ON t.tour_id = tr.id AND t.lang = 'ru'
        ORDER BY tr.sort, tr.id`,
    )
    .all() as Row[];
}

/* ------------------------------------------------------------------ */
/* Музеи и экспонаты                                                  */
/* ------------------------------------------------------------------ */

export function ensureMuseum(poiId: number): number {
  const db = getDb();
  db.prepare(`INSERT OR IGNORE INTO museums (poi_id) VALUES (?)`).run(poiId);
  return Number((db.prepare(`SELECT id FROM museums WHERE poi_id = ?`).get(poiId) as Row).id);
}

export function upsertExhibit(input: {
  id?: number;
  museumId: number;
  number: string;
  period: string | null;
  origin: string | null;
  sort: number;
  translations: Partial<Record<Lang, { name: string; shortDesc: string; fullStory: string }>>;
}): number {
  const db = getDb();
  let id = input.id;

  if (id) {
    db.prepare(
      `UPDATE exhibits SET number = ?, period = ?, origin = ?, sort = ? WHERE id = ?`,
    ).run(input.number, input.period, input.origin, input.sort, id);
  } else {
    const existing = db
      .prepare(`SELECT id FROM exhibits WHERE museum_id = ? AND number = ?`)
      .get(input.museumId, input.number) as Row | undefined;
    if (existing) {
      id = Number(existing.id);
      db.prepare(`UPDATE exhibits SET period = ?, origin = ?, sort = ? WHERE id = ?`).run(
        input.period,
        input.origin,
        input.sort,
        id,
      );
    } else {
      db.prepare(
        `INSERT INTO exhibits (museum_id, number, period, origin, sort) VALUES (?, ?, ?, ?, ?)`,
      ).run(input.museumId, input.number, input.period, input.origin, input.sort);
      id = Number((db.prepare(`SELECT last_insert_rowid() AS id`).get() as Row).id);
    }
  }

  for (const [lang, tr] of Object.entries(input.translations)) {
    if (!tr?.name) continue;
    db.prepare(
      `INSERT INTO exhibit_translations (exhibit_id, lang, name, short_desc, full_story)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(exhibit_id, lang) DO UPDATE SET
         name = excluded.name, short_desc = excluded.short_desc, full_story = excluded.full_story`,
    ).run(id, lang, tr.name, tr.shortDesc || null, tr.fullStory || null);
  }

  return id as number;
}

export function deleteExhibit(id: number): void {
  getDb().prepare(`DELETE FROM exhibits WHERE id = ?`).run(id);
}

/* ------------------------------------------------------------------ */
/* Праздники и фестивали                                              */
/* ------------------------------------------------------------------ */

export function upsertFestival(input: {
  slug: string;
  citySlug: string | null;
  month: number;
  day: number | null;
  year: number | null;
  days: number;
  sort: number;
  isActive: boolean;
  translations: Partial<Record<Lang, { name: string; description: string }>>;
}): number {
  const db = getDb();
  let cityId: number | null = null;
  if (input.citySlug) {
    const row = db.prepare(`SELECT id FROM cities WHERE slug = ?`).get(input.citySlug) as Row | undefined;
    if (!row) throw new Error(`Город «${input.citySlug}» не найден`);
    cityId = Number(row.id);
  }

  db.prepare(
    `INSERT INTO festivals (slug, city_id, month, day, year, days, sort, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       city_id = excluded.city_id, month = excluded.month, day = excluded.day,
       year = excluded.year, days = excluded.days, sort = excluded.sort,
       is_active = excluded.is_active`,
  ).run(
    input.slug, cityId, input.month, input.day, input.year,
    input.days, input.sort, input.isActive ? 1 : 0,
  );

  const id = Number((db.prepare(`SELECT id FROM festivals WHERE slug = ?`).get(input.slug) as Row).id);

  for (const [lang, tr] of Object.entries(input.translations)) {
    if (!tr?.name) continue;
    db.prepare(
      `INSERT INTO festival_translations (festival_id, lang, name, description)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(festival_id, lang) DO UPDATE SET
         name = excluded.name, description = excluded.description`,
    ).run(id, lang, tr.name, tr.description || null);
  }
  return id;
}

export function deleteFestival(slug: string): void {
  getDb().prepare(`DELETE FROM festivals WHERE slug = ?`).run(slug);
}

export function listFestivalsAdmin() {
  return getDb()
    .prepare(
      `SELECT f.id, f.slug, f.month, f.day, f.year, f.days, f.sort, f.is_active,
              c.slug AS city_slug,
              COALESCE(t.name, f.slug) AS name
         FROM festivals f
         LEFT JOIN cities c ON c.id = f.city_id
         LEFT JOIN festival_translations t ON t.festival_id = f.id AND t.lang = 'ru'
        ORDER BY f.month, f.day`,
    )
    .all() as Row[];
}

/* ------------------------------------------------------------------ */
/* Рекламные блоки                                                    */
/* ------------------------------------------------------------------ */

export function upsertAdBanner(input: {
  id?: number;
  slot: string;
  lang: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  url: string;
  weight: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}): void {
  const db = getDb();
  if (input.id) {
    db.prepare(
      `UPDATE ad_banners SET slot = ?, lang = ?, title = ?, subtitle = ?,
              cta_label = ?, url = ?, weight = ?, starts_at = ?, ends_at = ?, is_active = ?
        WHERE id = ?`,
    ).run(
      input.slot, input.lang, input.title, input.subtitle, input.ctaLabel,
      input.url, input.weight, input.startsAt, input.endsAt, input.isActive ? 1 : 0, input.id,
    );
    return;
  }
  db.prepare(
    `INSERT INTO ad_banners (slot, lang, title, subtitle, cta_label, url, weight, starts_at, ends_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    input.slot, input.lang, input.title, input.subtitle, input.ctaLabel,
    input.url, input.weight, input.startsAt, input.endsAt, input.isActive ? 1 : 0,
  );
}

export function deleteAdBanner(id: number): void {
  getDb().prepare(`DELETE FROM ad_banners WHERE id = ?`).run(id);
}

export function setAdBannerActive(id: number, active: boolean): void {
  getDb().prepare(`UPDATE ad_banners SET is_active = ? WHERE id = ?`).run(active ? 1 : 0, id);
}

export function listAdBannersAdmin() {
  return getDb()
    .prepare(
      `SELECT id, slot, lang, title, subtitle, cta_label, url, weight,
              starts_at, ends_at, impressions, clicks, is_active
         FROM ad_banners ORDER BY slot, weight DESC, id`,
    )
    .all() as Row[];
}

/* ------------------------------------------------------------------ */
/* Поддержка                                                          */
/* ------------------------------------------------------------------ */

export function listSupportAdmin() {
  return getDb()
    .prepare(
      `SELECT id, topic, message, contact, lang, status, created_at
         FROM support_tickets ORDER BY created_at DESC`,
    )
    .all() as Row[];
}

export function updateSupportStatus(id: number, status: "new" | "done"): void {
  getDb().prepare(`UPDATE support_tickets SET status = ? WHERE id = ?`).run(status, id);
}

/* ------------------------------------------------------------------ */
/* Заявки на столик                                                   */
/* ------------------------------------------------------------------ */

export function listReservationsAdmin() {
  const db = getDb();
  return db
    .prepare(
      `SELECT r.id, r.name, r.phone, r.party_size, r.requested_at, r.note,
              r.status, r.created_at, p.slug AS poi_slug, c.slug AS city_slug,
              COALESCE(t.name, p.slug) AS poi_name
         FROM reservations r
         JOIN pois p   ON p.id = r.poi_id
         JOIN cities c ON c.id = p.city_id
         LEFT JOIN poi_translations t ON t.poi_id = p.id AND t.lang = 'ru'
        ORDER BY r.created_at DESC`,
    )
    .all() as Row[];
}

export function updateReservationStatus(
  id: number,
  status: "new" | "confirmed" | "declined",
): void {
  getDb().prepare(`UPDATE reservations SET status = ? WHERE id = ?`).run(status, id);
}

export function listMuseumsAdmin() {
  const db = getDb();
  return db
    .prepare(
      `SELECT m.id, m.poi_id, p.slug AS poi_slug, c.slug AS city_slug,
              COALESCE(t.name, p.slug) AS name,
              (SELECT COUNT(*) FROM exhibits e WHERE e.museum_id = m.id) AS exhibit_count
         FROM museums m
         JOIN pois p   ON p.id = m.poi_id
         JOIN cities c ON c.id = p.city_id
         LEFT JOIN poi_translations t ON t.poi_id = p.id AND t.lang = 'ru'
        ORDER BY c.slug, name`,
    )
    .all() as Row[];
}
