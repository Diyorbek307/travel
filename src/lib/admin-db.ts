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
  const poi = db.prepare(`SELECT p.*, c.slug AS city_slug FROM pois p
      JOIN cities c ON c.id = p.city_id WHERE p.slug = ?`).get(slug) as Row | undefined;
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
