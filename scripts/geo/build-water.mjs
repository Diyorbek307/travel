/**
 * Готовит слой воды для трёхмерной карты: реки и озёра Узбекистана.
 *
 * Источник — Natural Earth 10m (public domain), файлы
 * ne_10m_rivers_lake_centerlines.geojson и ne_10m_lakes.geojson.
 * Исходники весят порядка 12 МБ и в репозиторий не попадают: скрипт
 * вырезает Узбекистан, упрощает геометрию и кладёт результат
 * в src/data/uzbekistan-water.json — несколько десятков килобайт.
 *
 * Запуск:
 *   node scripts/geo/build-water.mjs <папка-с-geojson>
 *
 * Реки обрезаются по государственной границе, собранной из тех же
 * регионов, что и рельеф карты: река, уходящая в Туркмению, обрывается
 * на границе, а не тянется через пустой фон.
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

const regions = JSON.parse(
  fs.readFileSync(path.join(root, "src", "data", "uzbekistan-regions.json"), "utf8"),
);

/** Луч вправо: нечётное число пересечений — точка внутри кольца. */
function inRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

const inCountry = (lon, lat) => regions.some((r) => inRing(lon, lat, r.ring));

/** Дуглас–Пекер: выбрасывает точки, не меняющие форму линии. */
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
 * Упрощение замкнутого кольца.
 *
 * Напрямую Дуглас–Пекер на кольце не работает: у него первая и последняя
 * точки совпадают, опорный отрезок вырождается в точку, расстояние до него
 * у всех вершин выходит нулевым — и любое озеро схлопывается в две точки.
 * Поэтому кольцо разрезаем на две дуги в самой удалённой от начала вершине
 * и упрощаем каждую отдельно.
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

const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(src, name), "utf8")).features;

/** Разбивает линию на куски, лежащие внутри страны. */
function clipToCountry(line) {
  const pieces = [];
  let current = [];

  for (const point of line) {
    if (inCountry(point[0], point[1])) {
      current.push(point);
    } else {
      // Точку за границей добавляем как последнюю: иначе река
      // не дотягивается до края страны и повисает в воздухе.
      if (current.length) {
        current.push(point);
        pieces.push(current);
        current = [];
      }
    }
  }
  if (current.length) pieces.push(current);

  return pieces.filter((p) => p.length >= 2);
}

const rivers = [];
for (const f of read("ne_10m_rivers_lake_centerlines.geojson")) {
  const g = f.geometry;
  if (!g) continue;
  const lines = g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : [];

  for (const line of lines) {
    for (const piece of clipToCountry(line)) {
      const simple = simplify(piece, 0.01);
      // Совсем короткие обрывки только зашумляют карту.
      if (simple.length >= 2) {
        rivers.push({ name: f.properties?.name ?? null, path: simple });
      }
    }
  }
}

const UZ = { minLon: 55.9, maxLon: 73.3, minLat: 37.1, maxLat: 45.7 };
const lakes = [];
for (const f of read("ne_10m_lakes.geojson")) {
  const g = f.geometry;
  if (!g || g.type !== "Polygon") continue;
  const ring = g.coordinates[0];

  const nearby = ring.some(
    ([lon, lat]) =>
      lon >= UZ.minLon && lon <= UZ.maxLon && lat >= UZ.minLat && lat <= UZ.maxLat,
  );
  // Озеро целиком за границей висело бы над пустым фоном: на карте
  // нарисована только страна, соседних территорий под ним нет.
  if (!nearby || !ring.some(([lon, lat]) => inCountry(lon, lat))) continue;

  const simple = simplifyRing(ring, 0.02);
  if (simple.length >= 4) {
    lakes.push({ name: f.properties?.name ?? null, ring: simple });
  }
}

const out = { rivers, lakes };
const dest = path.join(root, "src", "data", "uzbekistan-water.json");
fs.writeFileSync(dest, JSON.stringify(out));

const points =
  rivers.reduce((n, r) => n + r.path.length, 0) +
  lakes.reduce((n, l) => n + l.ring.length, 0);

console.log(`рек: ${rivers.length}, озёр: ${lakes.length}, точек: ${points}`);
console.log(`${(fs.statSync(dest).size / 1024).toFixed(1)} КБ → ${path.relative(root, dest)}`);
console.log("озёра:", [...new Set(lakes.map((l) => l.name).filter(Boolean))].join(", "));
console.log("реки:", [...new Set(rivers.map((r) => r.name).filter(Boolean))].slice(0, 12).join(", "));
