/**
 * Наполнение базы демо-контентом.
 *
 *   npm run seed                 — пересоздать базу с нуля
 *   npm run seed -- --keep       — досыпать контент, не удаляя базу
 *   npm run seed -- --if-empty   — заполнить только пустую базу
 *
 * Режим --if-empty используется при запуске на хостинге: если к сервису
 * подключён постоянный диск, база переживает перезапуск, и повторный сид
 * затёр бы правки, сделанные через админ-панель.
 *
 * Тексты — черновой демо-контент (см. scripts/content/_helpers.mjs).
 */

import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "../src/lib/schema.js";
import { dbPath } from "../src/lib/paths.js";

/**
 * Снимки объектов и их атрибуция.
 *
 * Манифест собирает scripts/media/fetch-photos.mjs с Викисклада. Здесь он
 * только раскладывается по объектам: у кого снимка нет, тот остаётся с
 * орнаментной плашкой — подставлять чужую фотографию нельзя.
 */
const PHOTO_CREDITS = JSON.parse(
  readFileSync(new URL("../src/data/photo-credits.json", import.meta.url), "utf8"),
);

import samarkand from "./content/samarkand.mjs";
import bukhara from "./content/bukhara.mjs";
import khiva from "./content/khiva.mjs";
import tashkent from "./content/tashkent.mjs";
import shakhrisabz from "./content/shakhrisabz.mjs";
import nukus from "./content/nukus.mjs";
import termez from "./content/termez.mjs";
import fergana from "./content/fergana.mjs";
import andijan from "./content/andijan.mjs";
import namangan from "./content/namangan.mjs";
import navoi from "./content/navoi.mjs";
import jizzakh from "./content/jizzakh.mjs";
import karshi from "./content/karshi.mjs";
import gulistan from "./content/gulistan.mjs";

// Порядок влияет только на сообщение сидера; на выдачу — популярность объектов.
const CITIES = [
  tashkent, samarkand, bukhara, khiva,
  shakhrisabz, nukus, termez, fergana,
  andijan, namangan, navoi, jizzakh, karshi, gulistan,
];

/** Маршруты через несколько городов (п. 10 ТЗ). Привязываются к городу старта. */
const MULTI_CITY_TOURS = [
  {
    anchor: "tashkent",
    slug: "silk-road-classic",
    mode: "car",
    sort: 10,
    tr: {
      ru: {
        title: "Великий шёлковый путь: Ташкент → Самарканд → Бухара → Хива",
        description:
          "Классический маршрут по стране на 7–10 дней. Между городами — скоростные поезда «Афросиаб»: Ташкент — Самарканд 2 ч 10 мин, Самарканд — Бухара 1 ч 30 мин. До Хивы удобнее ночным поездом или самолётом.",
      },
      en: {
        title: "The Great Silk Road: Tashkent → Samarkand → Bukhara → Khiva",
        description:
          "The classic seven-to-ten-day route across the country. Afrosiyob high-speed trains link the cities: Tashkent to Samarkand in 2 h 10, Samarkand to Bukhara in 1 h 30. Khiva is best reached by night train or by air.",
      },
      uz: {
        title: "Buyuk ipak yo'li: Toshkent → Samarqand → Buxoro → Xiva",
        description:
          "Mamlakat bo'ylab 7–10 kunlik klassik marshrut. Shaharlar orasida «Afrosiyob» tezyurar poyezdlari qatnaydi.",
      },
    },
    stops: [
      ["khast-imam", 60],
      ["chorsu-bazaar", 50],
      ["registan", 90],
      ["gur-e-amir", 45],
      ["shah-i-zinda", 60],
      ["poi-kalyan", 60],
      ["ark-fortress", 70],
      ["lyabi-hauz", 40],
      ["ichan-kala", 120],
      ["kunya-ark", 50],
    ],
  },
  {
    anchor: "samarkand",
    slug: "islamic-heritage-uzbekistan",
    mode: "car",
    sort: 11,
    tr: {
      ru: {
        title: "Исламское наследие Узбекистана",
        description:
          "Мечети, медресе и святыни трёх городов: от старейшего мусульманского здания региона до действующих ханак и мест паломничества.",
      },
      en: {
        title: "Islamic heritage of Uzbekistan",
        description:
          "Mosques, madrasahs and shrines across three cities: from the oldest Muslim building in the region to working khanaqas and places of pilgrimage.",
      },
      uz: {
        title: "O'zbekistonning islom merosi",
        description:
          "Uch shahar masjidlari, madrasalari va ziyoratgohlari: mintaqadagi eng qadimiy musulmon binosidan amaldagi xonaqohlargacha.",
      },
    },
    stops: [
      ["hazrat-khizr", 30],
      ["shah-i-zinda", 60],
      ["bibi-khanym", 40],
      ["samanid-mausoleum", 25],
      ["poi-kalyan", 60],
      ["bolo-hauz", 20],
      ["pahlavan-mahmud", 25],
      ["khast-imam", 60],
    ],
  },
  {
    anchor: "samarkand",
    slug: "gastronomic-uzbekistan",
    mode: "taxi",
    sort: 12,
    tr: {
      ru: {
        title: "Гастрономический Узбекистан",
        description:
          "Базары, чайханы и плов: где пробовать самаркандскую лепёшку, бухарский плов, хорезмский шивит-оши и ташкентский плов из казана.",
      },
      en: {
        title: "Uzbekistan for food",
        description:
          "Bazaars, teahouses and plov: where to try Samarkand bread, Bukharan plov, Khorezmian shivit oshi and Tashkent cauldron plov.",
      },
      uz: {
        title: "Gastronomik O'zbekiston",
        description:
          "Bozorlar, choyxonalar va palov: samarqand noni, buxoro palovi, xorazm shivit oshi va toshkent palovini qayerda tatib ko'rish mumkin.",
      },
    },
    stops: [
      ["siab-bazaar", 40],
      ["bibikhanum-teahouse", 45],
      ["old-bukhara-restaurant", 60],
      ["trading-domes", 45],
      ["khorezm-art-restaurant", 60],
      ["chorsu-bazaar", 50],
      ["plov-centre", 50],
    ],
  },
];

/* ------------------------------------------------------------------ */

const DB_PATH = dbPath();
const keep = process.argv.includes("--keep");
const ifEmpty = process.argv.includes("--if-empty");

if (ifEmpty && existsSync(DB_PATH)) {
  const probe = new DatabaseSync(DB_PATH);
  probe.exec(SCHEMA_SQL);
  const { n } = probe.prepare("SELECT COUNT(*) AS n FROM pois").get();
  probe.close();
  if (Number(n) > 0) {
    console.log(`База уже заполнена (${n} объектов) — сид пропущен: ${DB_PATH}`);
    process.exit(0);
  }
}

if (!keep && !ifEmpty) {
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    const f = DB_PATH + suffix;
    if (existsSync(f)) rmSync(f);
  }
}
mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON");
db.exec(SCHEMA_SQL);

const run = (sql, ...args) => db.prepare(sql).run(...args);
const one = (sql, ...args) => db.prepare(sql).get(...args);

let counts = { cities: 0, pois: 0, translations: 0, tours: 0, exhibits: 0, qr: 0 };

/** Соответствие slug объекта → id, нужно для сборки маршрутов. */
const poiIds = new Map();

for (const city of CITIES) {
  run(
    `INSERT INTO cities (slug, lat, lon, zoom, is_active) VALUES (?, ?, ?, ?, 1)
     ON CONFLICT(slug) DO UPDATE SET lat = excluded.lat, lon = excluded.lon`,
    city.slug,
    city.lat,
    city.lon,
    city.zoom,
  );
  const cityId = Number(one(`SELECT id FROM cities WHERE slug = ?`, city.slug).id);
  counts.cities++;

  for (const [lang, tr] of Object.entries(city.tr)) {
    run(
      `INSERT INTO city_translations (city_id, lang, name, description) VALUES (?, ?, ?, ?)
       ON CONFLICT(city_id, lang) DO UPDATE SET name = excluded.name, description = excluded.description`,
      cityId,
      lang,
      tr.name,
      tr.description ?? null,
    );
    counts.translations++;
  }

  for (const p of city.pois) {
    run(
      `INSERT INTO pois
         (city_id, slug, category, themes, lat, lon, price_uzs, is_free,
          opening_hours, avg_visit_min, rating, popularity, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON CONFLICT(slug) DO UPDATE SET
         category = excluded.category, themes = excluded.themes,
         lat = excluded.lat, lon = excluded.lon,
         price_uzs = excluded.price_uzs, is_free = excluded.is_free,
         opening_hours = excluded.opening_hours,
         avg_visit_min = excluded.avg_visit_min,
         rating = excluded.rating, popularity = excluded.popularity`,
      cityId,
      p.slug,
      p.category,
      JSON.stringify(p.themes ?? []),
      p.lat,
      p.lon,
      p.price ?? 0,
      (p.price ?? 0) === 0 ? 1 : 0,
      p.hours ? JSON.stringify(p.hours) : null,
      p.visit ?? 30,
      p.rating ?? 4.5,
      p.pop ?? 0.5,
    );
    const poiId = Number(one(`SELECT id FROM pois WHERE slug = ?`, p.slug).id);
    poiIds.set(p.slug, poiId);
    counts.pois++;

    if (p.sponsoredPriority) {
      run(
        `INSERT INTO venue_details (poi_id, sponsored_priority) VALUES (?, ?)
         ON CONFLICT(poi_id) DO UPDATE SET sponsored_priority = excluded.sponsored_priority`,
        poiId,
        p.sponsoredPriority,
      );
    }

    for (const [lang, tr] of Object.entries(p.tr)) {
      run(
        `INSERT INTO poi_translations (poi_id, lang, name, short_desc, full_story)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(poi_id, lang) DO UPDATE SET
           name = excluded.name, short_desc = excluded.short_desc, full_story = excluded.full_story`,
        poiId,
        lang,
        tr.n,
        tr.s ?? null,
        tr.f ?? null,
      );
      counts.translations++;
    }

    const photo = PHOTO_CREDITS[p.slug];
    if (photo) {
      run(`UPDATE pois SET cover = ? WHERE id = ?`, photo.file, poiId);

      // Снимок без подписи публиковать нельзя, поэтому автор и лицензия
      // едут вместе с ним одной строкой.
      run(`DELETE FROM poi_media WHERE poi_id = ? AND url = ?`, poiId, photo.file);
      run(
        `INSERT INTO poi_media (poi_id, url, caption, author, license, source, sort)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        poiId,
        photo.file,
        photo.title ?? null,
        photo.author ?? null,
        photo.license ?? null,
        photo.source ?? null,
      );
      counts.photos = (counts.photos ?? 0) + 1;
    }

    if (p.qr) {
      run(
        `INSERT INTO qr_codes (code, target_type, target_id) VALUES (?, 'poi', ?)
         ON CONFLICT(code) DO UPDATE SET target_id = excluded.target_id`,
        p.qr,
        poiId,
      );
      counts.qr++;
    }

    if (p.museum) {
      run(`INSERT OR IGNORE INTO museums (poi_id) VALUES (?)`, poiId);
      const museumId = Number(one(`SELECT id FROM museums WHERE poi_id = ?`, poiId).id);

      p.museum.forEach((ex, i) => {
        const existing = one(
          `SELECT id FROM exhibits WHERE museum_id = ? AND number = ?`,
          museumId,
          ex.number,
        );
        let exhibitId;
        if (existing) {
          exhibitId = Number(existing.id);
          run(
            `UPDATE exhibits SET period = ?, origin = ?, sort = ? WHERE id = ?`,
            ex.period ?? null,
            ex.origin ?? null,
            i,
            exhibitId,
          );
        } else {
          run(
            `INSERT INTO exhibits (museum_id, number, period, origin, sort) VALUES (?, ?, ?, ?, ?)`,
            museumId,
            ex.number,
            ex.period ?? null,
            ex.origin ?? null,
            i,
          );
          exhibitId = Number(one(`SELECT last_insert_rowid() AS id`).id);
        }
        counts.exhibits++;

        for (const [lang, tr] of Object.entries(ex.tr)) {
          run(
            `INSERT INTO exhibit_translations (exhibit_id, lang, name, short_desc, full_story)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(exhibit_id, lang) DO UPDATE SET
               name = excluded.name, short_desc = excluded.short_desc, full_story = excluded.full_story`,
            exhibitId,
            lang,
            tr.n,
            tr.s ?? null,
            tr.f ?? null,
          );
          counts.translations++;
        }

        // QR у каждой витрины: код объекта + номер экспоната.
        const code = `${p.qr ?? p.slug.toUpperCase().slice(0, 6)}-E${ex.number}`;
        run(
          `INSERT INTO qr_codes (code, target_type, target_id) VALUES (?, 'exhibit', ?)
           ON CONFLICT(code) DO UPDATE SET target_id = excluded.target_id`,
          code,
          exhibitId,
        );
        counts.qr++;
      });
    }
  }
}

/** Вставка маршрута. Возвращает id. */
function insertTour(tour, cityId) {
  const totalMin = tour.stops.reduce((s, [, stay]) => s + stay, 0);
  run(
    `INSERT INTO tours (slug, city_id, kind, mode, total_min, sort, is_active)
     VALUES (?, ?, 'curated', ?, ?, ?, 1)
     ON CONFLICT(slug) DO UPDATE SET
       city_id = excluded.city_id, mode = excluded.mode,
       total_min = excluded.total_min, sort = excluded.sort`,
    tour.slug,
    cityId,
    tour.mode,
    totalMin,
    tour.sort ?? 0,
  );
  const tourId = Number(one(`SELECT id FROM tours WHERE slug = ?`, tour.slug).id);

  for (const [lang, tr] of Object.entries(tour.tr)) {
    run(
      `INSERT INTO tour_translations (tour_id, lang, title, description) VALUES (?, ?, ?, ?)
       ON CONFLICT(tour_id, lang) DO UPDATE SET
         title = excluded.title, description = excluded.description`,
      tourId,
      lang,
      tr.title,
      tr.description ?? null,
    );
    counts.translations++;
  }

  run(`DELETE FROM tour_stops WHERE tour_id = ?`, tourId);
  tour.stops.forEach(([slug, stay], i) => {
    const poiId = poiIds.get(slug);
    if (!poiId) {
      console.warn(`  ! маршрут ${tour.slug}: объект "${slug}" не найден, остановка пропущена`);
      return;
    }
    run(
      `INSERT INTO tour_stops (tour_id, poi_id, order_index, stay_min) VALUES (?, ?, ?, ?)`,
      tourId,
      poiId,
      i,
      stay,
    );
  });
  counts.tours++;
  return tourId;
}

for (const city of CITIES) {
  const cityId = Number(one(`SELECT id FROM cities WHERE slug = ?`, city.slug).id);
  for (const tour of city.tours ?? []) insertTour(tour, cityId);
}

for (const tour of MULTI_CITY_TOURS) {
  const cityId = Number(one(`SELECT id FROM cities WHERE slug = ?`, tour.anchor).id);
  insertTour(tour, cityId);
}

db.close();

console.log("База заполнена:", DB_PATH);
console.log(`  городов:      ${counts.cities}`);
console.log(`  объектов:     ${counts.pois}`);
console.log(`  переводов:    ${counts.translations}`);
console.log(`  маршрутов:    ${counts.tours}`);
console.log(`  экспонатов:   ${counts.exhibits}`);
console.log(`  QR-кодов:     ${counts.qr}`);
console.log("\nАудиогиды: профессиональная озвучка не записана — приложение");
console.log("озвучивает тексты синтезом речи и помечает это в интерфейсе.");
console.log("Реальные mp3 загружаются через админ-панель: /admin/audio");
