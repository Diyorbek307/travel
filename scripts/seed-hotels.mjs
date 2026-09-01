/**
 * Заготовки гостиниц для админ-панели.
 *
 * Запуск: node scripts/seed-hotels.mjs
 *
 * Зачем отдельный скрипт, а не общий сидер: это не контент платформы, а
 * рыба для заполнения. Гостиницы заводятся СКРЫТЫМИ (is_active = 0) и
 * туристу не показываются, пока администратор не откроет каждую в
 * /admin/pois, не проверит данные и не поставит галочку «Показывать».
 *
 * Что здесь правда, а что нет:
 *   — названия настоящие, это существующие гостиницы Узбекистана;
 *   — координаты стоят по центру города, а НЕ по адресу гостиницы;
 *   — цена 0 означает «уточняется», а не «бесплатно»;
 *   — рейтинг намеренно занижен до 0, чтобы черновик не всплыл наверх.
 *
 * Ставить сюда выдуманные координаты и цены нельзя: турист, приехавший
 * по неверному адресу с неверной ценой, теряет вечер и доверие к
 * платформе. Поэтому поля, которых мы не знаем, оставлены пустыми —
 * их видно в админке и понятно, что заполнить.
 */

import { DatabaseSync } from "node:sqlite";
import { SCHEMA_SQL } from "../src/lib/schema.js";
import { dbPath } from "../src/lib/paths.js";

const DB_PATH = dbPath();
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON");
db.exec(SCHEMA_SQL);

const run = (sql, ...args) => db.prepare(sql).run(...args);
const one = (sql, ...args) => db.prepare(sql).get(...args);

/** Существующие гостиницы. Адреса и цены заполняются в админке. */
const HOTELS = [
  { slug: "hotel-lotte-city-tashkent", city: "tashkent", ru: "Lotte City Hotel Tashkent Palace", en: "Lotte City Hotel Tashkent Palace" },
  { slug: "hotel-hyatt-regency-tashkent", city: "tashkent", ru: "Hyatt Regency Tashkent", en: "Hyatt Regency Tashkent" },
  { slug: "hotel-registan-plaza", city: "samarkand", ru: "Registan Plaza", en: "Registan Plaza" },
  { slug: "hotel-silk-road-samarkand", city: "samarkand", ru: "Silk Road by Minyoun", en: "Silk Road by Minyoun" },
  { slug: "hotel-asia-bukhara", city: "bukhara", ru: "Asia Bukhara", en: "Asia Bukhara" },
  { slug: "hotel-orient-star-khiva", city: "khiva", ru: "Orient Star Khiva", en: "Orient Star Khiva" },
];

const DRAFT_RU =
  "Черновик: адрес, цена и описание не заполнены. Проверьте данные в админ-панели и включите показ.";
const DRAFT_EN =
  "Draft: address, price and description are not filled in. Check the data in the admin panel and enable it.";

let added = 0;
for (const h of HOTELS) {
  const city = one(`SELECT id, lat, lon FROM cities WHERE slug = ?`, h.city);
  if (!city) {
    console.warn(`  пропущен ${h.slug}: города «${h.city}» нет в базе`);
    continue;
  }

  // Уже заведённые не трогаем: администратор мог их дозаполнить, и
  // повторный запуск скрипта не должен стирать его работу.
  if (one(`SELECT id FROM pois WHERE slug = ?`, h.slug)) {
    console.log(`  уже есть, пропущен: ${h.slug}`);
    continue;
  }

  run(
    `INSERT INTO pois
       (city_id, slug, category, themes, lat, lon, price_uzs, is_free,
        avg_visit_min, rating, popularity, is_active)
     VALUES (?, ?, 'hotel', '[]', ?, ?, 0, 0, 60, 0, 0, 0)`,
    Number(city.id), h.slug, Number(city.lat), Number(city.lon),
  );
  const id = Number(one(`SELECT id FROM pois WHERE slug = ?`, h.slug).id);

  run(
    `INSERT INTO poi_translations (poi_id, lang, name, short_desc) VALUES (?, 'ru', ?, ?)`,
    id, h.ru, DRAFT_RU,
  );
  run(
    `INSERT INTO poi_translations (poi_id, lang, name, short_desc) VALUES (?, 'en', ?, ?)`,
    id, h.en, DRAFT_EN,
  );
  added++;
}

db.close();

console.log(`\nДобавлено черновиков гостиниц: ${added}`);
console.log("Все они СКРЫТЫ от туристов (is_active = 0).");
console.log("Откройте /admin/pois, впишите координаты и цену, затем включите показ.");
console.log("Координаты сейчас стоят по центру города — это заглушка, а не адрес.");
