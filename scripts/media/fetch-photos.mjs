/**
 * Собирает фотографии объектов с Викисклада.
 *
 * Зачем: весь язык современных travel-приложений построен на снимке во весь
 * экран. Без фотографий любая вёрстка остаётся набором скруглённых
 * прямоугольников. Своих снимков у нас нет, чужие без лицензии брать нельзя —
 * поэтому берём Wikimedia Commons, где выложены свободные.
 *
 * Что делает:
 *   1. ищет по английскому названию объекта в пространстве файлов;
 *   2. отбрасывает всё, кроме свободных лицензий;
 *   3. проверяет, что найденный файл вообще про этот объект;
 *   4. скачивает уменьшенную копию (Викисклад отдаёт её сам, поэтому
 *      обработка изображений на нашей стороне не нужна);
 *   5. записывает автора, лицензию и ссылку на источник.
 *
 * Атрибуция обязательна: CC BY и CC BY-SA требуют указать автора и лицензию.
 * Поэтому манифест кладётся рядом со снимками и попадает в интерфейс —
 * снимок без подписи публиковать нельзя.
 *
 * Запуск:
 *   node scripts/media/fetch-photos.mjs          — только недостающие
 *   node scripts/media/fetch-photos.mjs --force  — заново всё
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
const outDir = path.join(root, "public", "photos", "poi");
const manifestPath = path.join(root, "src", "data", "photo-credits.json");

const FORCE = process.argv.includes("--force");

/** Викимедиа требует представляться: без этого запросы отклоняются. */
const UA =
  "UzbekistanTravelPlatform/0.1 (https://uzbekistan-travel.onrender.com) node-fetch";

/** Ширина копии. Викисклад уменьшает сам, поэтому обработка нам не нужна. */
const WIDTH = 1000;

/**
 * Лицензии, которые можно использовать с указанием авторства.
 * Всё остальное — включая «добросовестное использование» — не берём:
 * платформа коммерческая, и нам нужна чистая правовая база.
 */
const ALLOWED = /^(cc0|cc[ -]by([ -]sa)?([ -][\d.]+)?|public domain|pd-|no restrictions)/i;

/**
 * Категории, у которых на Викискладе снимков быть не может.
 * Искать «Ресторан Насаф» бессмысленно и вредно: поиск вернёт случайное
 * изображение, и оно окажется на карточке как настоящее.
 */
const SKIP_CATEGORIES = new Set([
  "restaurant",
  "cafe",
  "hotel",
  "toilet",
  "station",
  "airport",
  "transport",
]);

/**
 * Запросы для объектов, чьё название само по себе ищется плохо:
 * слишком общее, либо памятник известен под другим именем.
 */
const QUERY_OVERRIDE = {
  registan: "Registan Samarkand",
  "bibi-khanym": "Bibi-Khanym Mosque",
  shahi_zinda: "Shah-i-Zinda",
  gur_emir: "Gur-e-Amir",
  ulugbek_observatory: "Ulugh Beg Observatory Samarkand",
  "poi-kalyan": "Po-i-Kalyan Bukhara",
  ark: "Ark of Bukhara",
  "itchan-kala": "Itchan Kala Khiva",
  "kalta-minor": "Kalta Minor Khiva",
  chorsu: "Chorsu Bazaar Tashkent",
  "hazrati-imam": "Hazrati Imam Complex Tashkent",

  // Памятники, известные на Викискладе под другим написанием.
  // Без этого поиск по нашему названию не находит ничего.
  "kunya-ark": "Kunya-Ark Khiva",
  "islam-khoja": "Islom Xoja minaret Khiva",
  "savitsky-museum": "Nukus Museum of Art Savitsky",
  mizdakhan: "Mizdakhan necropolis",
  chilpyk: "Chilpik Kala",
  "sarmyshsay-petroglyphs": "Sarmish Say petroglyphs",
  "fayaz-tepa": "Fayaz Tepe",
  "kara-tepa": "Kara Tepe Termez",
  "jarkurgan-minaret": "Jarkurgan Minaret",
  "kyrk-kyz": "Kyrk Kyz Termez",
  akhsikent: "Akhsikath",
  "dorus-siadat": "Dorut Saodat Shahrisabz",
  "nurata-fortress": "Nurata fortress Uzbekistan",
  "mullah-kyrgyz-madrasah": "Mullah Kyrgyz madrasah Namangan",
  "babur-memorial-park": "Babur memorial Andijan",
  "shakhrisabz-chorsu": "Shahrisabz Chorsu trading dome",
  "ark-fortress": "Ark fortress Bukhara",
  "siab-bazaar": "Siab bazaar Samarkand",
  "fergana-park": "Al-Fergani park Fergana",

  // Найдено сверкой контактного листа: поиск подставил посторонние кадры.
  "ak-saray": "Ak-Saray palace Shahrisabz",
  "lyabi-hauz": "Lyab-i Hauz Bukhara",
  rukhabad: "Rukhabad mausoleum Samarkand",
  "khast-imam": "Hazrati Imam complex Tashkent",
  "kok-gumbaz": "Kok Gumbaz Shahrisabz",
  "kok-gumbaz-karshi": "Kok Gumbaz mosque Qarshi",
  "sitorai-mokhi-khosa": "Sitorai Mokhi Khosa palace",
  "afrosiyob-museum": "Afrasiab Museum Samarkand",
  "sultan-saodat": "Sultan Saodat ensemble Termez",
  "tash-hauli": "Tash Hauli palace Khiva",
};

/**
 * Объекты, которым лучше остаться без снимка.
 *
 * На Викискладе по ним нет ничего, кроме случайных кадров с места:
 * информационная табличка, аттракцион, чужой двор. Пустая орнаментная
 * плашка честнее подмены — турист не должен ехать за тем, чего не увидит.
 */
const NO_PHOTO = new Set([
  "akhsikent",       // информационная табличка на месте городища
  "karshi-bazaar",   // аттракцион вместо рынка
  "ak-saray",        // женщина с флагом, дворца в кадре нет
  "rukhabad",        // улица с автобусами и указателем «Самарканд»
  "khast-imam",      // пустая брусчатка
  "sultan-saodat",   // фрагмент решётки: не обманывает, но лицом комплекса быть не может
  "tash-hauli",      // дверь вместо дворца, то же самое
]);

/**
 * Названия, по которым проверка совпадения бессмысленна: у памятника
 * в запросе одно написание, в имени файла другое. Для них доверяем
 * запросу — он задан вручную и точен.
 */
const TRUST_QUERY = new Set([
  "ak-saray", "lyabi-hauz", "rukhabad", "khast-imam", "kok-gumbaz",
  "kok-gumbaz-karshi", "sitorai-mokhi-khosa", "afrosiyob-museum",
  "sultan-saodat", "tash-hauli",
  "kunya-ark", "islam-khoja", "savitsky-museum", "mizdakhan", "chilpyk",
  "sarmyshsay-petroglyphs", "fayaz-tepa", "kara-tepa", "jarkurgan-minaret",
  "kyrk-kyz", "akhsikent", "dorus-siadat", "nurata-fortress",
  "mullah-kyrgyz-madrasah", "babur-memorial-park", "shakhrisabz-chorsu",
  "ark-fortress", "siab-bazaar", "fergana-park",
]);

const stripTags = (value) => (value ?? "").replace(/<[^>]*>/g, "").trim();

/** Слова, по которым нельзя судить о совпадении. */
const STOP = new Set([
  "the", "of", "and", "in", "at", "a", "mosque", "museum", "bazaar",
  "complex", "square", "street", "monument", "memorial", "park", "house",
]);

const tokens = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((word) => word.length > 3 && !STOP.has(word));

/**
 * Проверка, что файл действительно про этот объект.
 *
 * Поиск Викисклада охотно возвращает что-нибудь из той же страны, и без
 * проверки на карточке мечети оказался бы чужой минарет. Требуем, чтобы
 * название файла содержало хотя бы одно значимое слово из названия.
 */
function relevant(title, name) {
  const wanted = tokens(name);
  if (!wanted.length) return false;
  const haystack = title.toLowerCase();
  return wanted.some((word) => haystack.includes(word));
}

async function search(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    "&gsrsearch=" + encodeURIComponent("filetype:bitmap " + query) +
    "&gsrnamespace=6&gsrlimit=8&prop=imageinfo" +
    "&iiprop=url|extmetadata|size&iiurlwidth=" + WIDTH +
    "&format=json&formatversion=2";

  const response = await fetch(url, { headers: { "User-Agent": UA } });
  if (!response.ok) throw new Error("поиск вернул " + response.status);

  const data = await response.json();
  return data.query?.pages ?? [];
}

async function download(url, dest) {
  const response = await fetch(url, { headers: { "User-Agent": UA } });
  if (!response.ok) throw new Error("скачивание вернуло " + response.status);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  return buffer.length;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ─────────────────────────── Сборка ─────────────────────────── */

fs.mkdirSync(outDir, { recursive: true });

const credits = fs.existsSync(manifestPath) && !FORCE
  ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  : {};

const contentDir = path.join(root, "scripts", "content");
const files = fs
  .readdirSync(contentDir)
  .filter((f) => f.endsWith(".mjs") && !f.startsWith("_"));

const targets = [];
for (const file of files) {
  const city = (await import("file://" + path.join(contentDir, file))).default;
  for (const poi of city.pois) {
    if (SKIP_CATEGORIES.has(poi.category) || NO_PHOTO.has(poi.slug)) continue;
    const name = poi.tr?.en?.n ?? poi.tr?.ru?.n;
    if (!name) continue;
    targets.push({ slug: poi.slug, name, city: city.slug, category: poi.category });
  }
}

console.log(`кандидатов: ${targets.length} из ${files.length} городов\n`);

let taken = 0;
let skipped = 0;
const missing = [];

for (const target of targets) {
  if (credits[target.slug] && !FORCE) {
    skipped++;
    continue;
  }

  const query = QUERY_OVERRIDE[target.slug] ?? `${target.name} Uzbekistan`;

  try {
    const pages = await search(query);

    const candidate = pages
      .map((page) => ({ page, info: page.imageinfo?.[0] }))
      .filter(({ page, info }) => {
        if (!info?.thumburl) return false;
        const license = stripTags(info.extmetadata?.LicenseShortName?.value);
        if (!ALLOWED.test(license)) return false;
        if (TRUST_QUERY.has(target.slug)) return true;
        return relevant(page.title, target.name);
      })
      // Крупнее оригинал — лучше исходник, даже если копию берём одну.
      .sort((a, b) => (b.info.width ?? 0) - (a.info.width ?? 0))[0];

    if (!candidate) {
      missing.push(`${target.slug} (${target.name})`);
      console.log(`  —  ${target.slug}: не нашлось`);
      await sleep(180);
      continue;
    }

    const { page, info } = candidate;
    const meta = info.extmetadata ?? {};
    const dest = path.join(outDir, `${target.slug}.jpg`);
    const bytes = await download(info.thumburl, dest);

    credits[target.slug] = {
      file: `/photos/poi/${target.slug}.jpg`,
      title: page.title.replace(/^File:/, ""),
      author: stripTags(meta.Artist?.value) || "Wikimedia Commons",
      license: stripTags(meta.LicenseShortName?.value) || "?",
      source: info.descriptionurl,
    };

    taken++;
    console.log(
      `  ✓  ${target.slug}: ${(bytes / 1024).toFixed(0)} КБ · ${credits[target.slug].license}`,
    );
  } catch (error) {
    missing.push(`${target.slug} (${error.message})`);
    console.log(`  !  ${target.slug}: ${error.message}`);
  }

  // Викимедиа просит не частить: у нас сотня запросов, спешить некуда.
  await sleep(180);
}

fs.writeFileSync(manifestPath, JSON.stringify(credits, null, 1));

const totalBytes = fs
  .readdirSync(outDir)
  .reduce((sum, f) => sum + fs.statSync(path.join(outDir, f)).size, 0);

console.log(`\nскачано: ${taken}, было: ${skipped}, без снимка: ${missing.length}`);
console.log(`всего в папке: ${(totalBytes / 1024 / 1024).toFixed(1)} МБ`);
if (missing.length) console.log(`\nбез снимка:\n  ${missing.join("\n  ")}`);
