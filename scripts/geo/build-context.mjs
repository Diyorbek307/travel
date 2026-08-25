/**
 * Готовит окружение для трёхмерной карты: соседние страны и крупная вода.
 *
 * Зачем: силуэт одного Узбекистана узнаёт только тот, кто и так знает, как
 * выглядит Узбекистан. Иностранному туристу — а это наш зритель — нужна
 * привязка: Каспий, Арал, Балхаш, Иссык-Куль и подписанные соседи.
 *
 * Приём взят у настоящих карт: основание сцены — вода, страны лежат на ней
 * сушей. Тогда Каспий и Персидский залив рисовать не нужно, они получаются
 * сами из промежутков между странами.
 *
 * Источник — Natural Earth (public domain), 50m admin-0 и 10m lakes.
 * Границы даны так, как их публикует Natural Earth — это нейтральный
 * стандартный источник, мы их не редактируем.
 *
 * Запуск:
 *   node scripts/geo/build-context.mjs <папка-с-geojson>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
const src = process.argv[2];

if (!src) {
  console.error("Укажите папку с файлами Natural Earth.");
  process.exit(1);
}

/**
 * Рамка кадра. Узбекистан занимает в ней примерно сорок процентов ширины:
 * достаточно, чтобы оставаться героем, и достаточно контекста, чтобы стало
 * понятно, где это на планете. В кадр специально попадают Каспий,
 * Персидский залив и Тянь-Шань.
 */
const BOX = { minLon: 48, maxLon: 88, minLat: 31, maxLat: 50 };

/** Узбекистан рисуется из своих регионов, из общего слоя его убираем. */
const SKIP = new Set(["Uzbekistan", "Siachen Glacier"]);

const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(src, name), "utf8")).features;

/* ─────────────────────────── Геометрия ─────────────────────────── */

/** Дуглас–Пекер для незамкнутой линии. */
function simplify(points, tolerance) {
  if (points.length < 3) return points;

  let maxDist = 0;
  let index = 0;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1e-12;

  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const dist = Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist <= tolerance) return [points[0], points[points.length - 1]];
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}

/**
 * Упрощение замкнутого кольца: разрезаем его в самой удалённой от начала
 * вершине и упрощаем две дуги по отдельности. Напрямую нельзя — у кольца
 * первая и последняя точки совпадают, опорный отрезок вырождается,
 * и любая фигура схлопывается в две точки.
 */
function simplifyRing(ring, tolerance) {
  const closed =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1];
  const open = closed ? ring.slice(0, -1) : ring;
  if (open.length < 4) return ring;

  let far = 0;
  let farDist = -1;
  for (let i = 1; i < open.length; i++) {
    const d = Math.hypot(open[i][0] - open[0][0], open[i][1] - open[0][1]);
    if (d > farDist) {
      farDist = d;
      far = i;
    }
  }

  const first = simplify(open.slice(0, far + 1), tolerance);
  const second = simplify([...open.slice(far), open[0]], tolerance);
  return [...first.slice(0, -1), ...second];
}

/**
 * Отсечение многоугольника прямоугольником по Сазерленду–Ходжману.
 *
 * Просто выбросить точки за рамкой нельзя: фигура схлопнется поперёк кадра
 * и Китай с Россией превратятся в рваные обрезки. Алгоритм режет рёбра
 * ровно по границе и оставляет замкнутый контур.
 */
function clipToBox(ring, box) {
  const edges = [
    { inside: (p) => p[0] >= box.minLon, cut: (a, b) => cutX(a, b, box.minLon) },
    { inside: (p) => p[0] <= box.maxLon, cut: (a, b) => cutX(a, b, box.maxLon) },
    { inside: (p) => p[1] >= box.minLat, cut: (a, b) => cutY(a, b, box.minLat) },
    { inside: (p) => p[1] <= box.maxLat, cut: (a, b) => cutY(a, b, box.maxLat) },
  ];

  function cutX(a, b, x) {
    const t = (x - a[0]) / (b[0] - a[0]);
    return [x, a[1] + (b[1] - a[1]) * t];
  }
  function cutY(a, b, y) {
    const t = (y - a[1]) / (b[1] - a[1]);
    return [a[0] + (b[0] - a[0]) * t, y];
  }

  let output = ring;
  for (const edge of edges) {
    const input = output;
    output = [];
    for (let i = 0; i < input.length; i++) {
      const current = input[i];
      const previous = input[(i + input.length - 1) % input.length];
      const currentIn = edge.inside(current);
      const previousIn = edge.inside(previous);

      if (currentIn) {
        if (!previousIn) output.push(edge.cut(previous, current));
        output.push(current);
      } else if (previousIn) {
        output.push(edge.cut(previous, current));
      }
    }
    if (output.length === 0) return [];
  }
  return output;
}

/** Площадь кольца в квадратных градусах — по формуле шнурков. */
function ringArea(ring) {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(sum / 2);
}

/** Центр тяжести кольца — точка для подписи. */
function centroid(ring) {
  let x = 0;
  let y = 0;
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    area += cross;
    x += (ring[j][0] + ring[i][0]) * cross;
    y += (ring[j][1] + ring[i][1]) * cross;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-9) return ring[0];
  return [x / (6 * area), y / (6 * area)];
}

/* ─────────────────────────── Названия ─────────────────────────── */

/**
 * Natural Earth даёт официальные и устаревшие формы: «Китайская Народная
 * Республика» не влезает ни в один кадр, «Туркмения» и «Киргизия» — старые
 * названия. На карте нужны короткие современные.
 */
const NAME_RU_OVERRIDE = {
  China: "Китай",
  Turkmenistan: "Туркменистан",
  Kyrgyzstan: "Кыргызстан",
};

/**
 * Узбекских названий в Natural Earth нет. Для прямых соседей и стран,
 * которые турист ищет глазами первыми, задаём их вручную; для остальных
 * остаётся английское написание — оно на латинице и читается.
 */
const NAME_UZ = {
  Kazakhstan: "Qozog'iston",
  Turkmenistan: "Turkmaniston",
  Tajikistan: "Tojikiston",
  Kyrgyzstan: "Qirg'iziston",
  Afghanistan: "Afg'oniston",
  Iran: "Eron",
  China: "Xitoy",
  Russia: "Rossiya",
  Pakistan: "Pokiston",
  India: "Hindiston",
  Azerbaijan: "Ozarbayjon",
  Mongolia: "Mo'g'uliston",
};

/* ─────────────────────────── Сборка ─────────────────────────── */

const COUNTRY_TOLERANCE = 0.09;
/** Обрезки мельче этого только шумят: острова и хвосты за рамкой. */
const MIN_COUNTRY_AREA = 0.6;

const countries = [];

for (const feature of read("ne_50m_admin_0_countries.geojson")) {
  const props = feature.properties;
  // NAME_EN — официальная длинная форма («People's Republic of China»),
  // короткая лежит в NAME. На карте нужна короткая.
  const nameEn = props.NAME || props.NAME_EN;
  if (SKIP.has(nameEn)) continue;

  const geometry = feature.geometry;
  if (!geometry) continue;

  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];

  const rings = [];
  for (const polygon of polygons) {
    const clipped = clipToBox(polygon[0], BOX);
    if (clipped.length < 4) continue;
    if (ringArea(clipped) < MIN_COUNTRY_AREA) continue;

    const simple = simplifyRing(clipped, COUNTRY_TOLERANCE);
    if (simple.length >= 4) rings.push(simple);
  }

  if (!rings.length) continue;

  const biggest = rings.reduce((a, b) => (ringArea(a) > ringArea(b) ? a : b));
  countries.push({
    nameEn,
    nameRu: NAME_RU_OVERRIDE[nameEn] ?? props.NAME_RU ?? nameEn,
    nameUz: NAME_UZ[nameEn] ?? nameEn,
    area: +ringArea(biggest).toFixed(2),
    label: centroid(biggest).map((v) => +v.toFixed(3)),
    rings,
  });
}

/* Вода: только заметные в этом масштабе водоёмы. */
const LAKE_TOLERANCE = 0.04;
const MIN_LAKE_AREA = 0.25;

const lakes = [];
for (const feature of read("ne_10m_lakes.geojson")) {
  const geometry = feature.geometry;
  if (!geometry) continue;

  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];

  for (const polygon of polygons) {
    const clipped = clipToBox(polygon[0], BOX);
    if (clipped.length < 4) continue;
    if (ringArea(clipped) < MIN_LAKE_AREA) continue;

    const simple = simplifyRing(clipped, LAKE_TOLERANCE);
    if (simple.length >= 4) {
      lakes.push({ name: feature.properties?.name ?? null, ring: simple });
    }
  }
}

const out = { box: BOX, countries, lakes };
const dest = path.join(root, "src", "data", "region-context.json");
fs.writeFileSync(dest, JSON.stringify(out));

const points =
  countries.reduce((n, c) => n + c.rings.reduce((m, r) => m + r.length, 0), 0) +
  lakes.reduce((n, l) => n + l.ring.length, 0);

console.log(`стран: ${countries.length}, водоёмов: ${lakes.length}, точек: ${points}`);
console.log(`${(fs.statSync(dest).size / 1024).toFixed(1)} КБ → ${path.relative(root, dest)}`);
console.log(
  "крупнейшие:",
  countries
    .slice()
    .sort((a, b) => b.area - a.area)
    .slice(0, 8)
    .map((c) => c.nameRu)
    .join(", "),
);
console.log("вода:", [...new Set(lakes.map((l) => l.name).filter(Boolean))].join(", "));
