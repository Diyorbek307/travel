import * as THREE from "three";
import regions from "@/data/uzbekistan-regions.json";
import water from "@/data/uzbekistan-water.json";
import context from "@/data/region-context.json";
import { SHORT_NAME } from "./city-names";
import { RAMP } from "./map-palette";
import type { Lang } from "./types";

/**
 * Картографическая основа трёхмерной карты: проекция, палитра и текстуры.
 *
 * Здесь нет React — только данные и рисование. Компонент сцены отвечает
 * за кадры и взаимодействие, этот модуль за то, как карта выглядит.
 *
 * Ключевое решение: всё окружение — море, соседние страны, крупные озёра,
 * координатная сетка, подписи стран, роза ветров и линейка масштаба —
 * запекается в одну текстуру основания. Это одна отрисовка вместо сотен
 * и позволяет рисовать сколько угодно мелких деталей средствами 2D,
 * где текст и тонкие линии выходят точнее, чем геометрией.
 *
 * Данные — Natural Earth (public domain).
 */

/* ─────────────────────────── Данные ─────────────────────────── */

export interface Region {
  city: string;
  extra: string[];
  nameRu: string;
  ring: [number, number][];
}

interface Water {
  rivers: { name: string | null; path: [number, number][] }[];
  lakes: { name: string | null; ring: [number, number][] }[];
}

interface Context {
  box: { minLon: number; maxLon: number; minLat: number; maxLat: number };
  countries: {
    nameEn: string;
    nameRu: string;
    nameUz: string;
    area: number;
    label: [number, number];
    rings: [number, number][][];
  }[];
  lakes: { name: string | null; ring: [number, number][] }[];
}

export const REGIONS = regions as Region[];
export const UZ_WATER = water as Water;
export const CONTEXT = context as unknown as Context;

/* ─────────────────────────── Проекция ─────────────────────────── */

const BOUNDS = (() => {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const r of REGIONS) {
    for (const [lon, lat] of r.ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return { minLon, maxLon, minLat, maxLat };
})();

const MID_LON = (BOUNDS.minLon + BOUNDS.maxLon) / 2;
const MID_LAT = (BOUNDS.minLat + BOUNDS.maxLat) / 2;

/**
 * Сжатие по долготе на широте страны.
 *
 * Без него градус долготы считается равным градусу широты, и Узбекистан
 * растягивается поперёк примерно на треть: на 41-й параллели градус долготы
 * составляет лишь cos(41°) ≈ 0,75 градуса широты.
 */
const LON_SQUEEZE = Math.cos((MID_LAT * Math.PI) / 180);

/** Ширина Узбекистана в единицах сцены. Всё остальное считается от неё. */
const UZ_WIDTH = 14;
export const SCALE = UZ_WIDTH / ((BOUNDS.maxLon - BOUNDS.minLon) * LON_SQUEEZE);

/** Градусы → координаты плоской фигуры, которую потом кладут в горизонт. */
export function project(lon: number, lat: number): [number, number] {
  return [(lon - MID_LON) * LON_SQUEEZE * SCALE, (lat - MID_LAT) * SCALE];
}

/**
 * Градусы → точка сцены. Фигуры поворачиваются на -90° вокруг X, поэтому
 * север смотрит в -Z, а высота идёт по Y.
 */
export function world(lon: number, lat: number, y = 0): THREE.Vector3 {
  const [x, z] = project(lon, lat);
  return new THREE.Vector3(x, y, -z);
}

const BOX = CONTEXT.box;
export const SHEET_W = (BOX.maxLon - BOX.minLon) * LON_SQUEEZE * SCALE;
export const SHEET_H = (BOX.maxLat - BOX.minLat) * SCALE;
/** Основание — не плоскость, а плита: у карты есть толщина и торец. */
export const SHEET_THICKNESS = 0.22;

/** Смещение центра листа: рамка кадра не симметрична вокруг Узбекистана. */
export const SHEET_CENTER = (() => {
  const [x, z] = project((BOX.minLon + BOX.maxLon) / 2, (BOX.minLat + BOX.maxLat) / 2);
  return { x, z: -z };
})();

/* ─────────────────────────── Палитра ─────────────────────────── */

export const PALETTE = {
  /* Основание — не море, а бумажный лист: так выглядит рельефная карта,
     на которую ориентирован макет. Вода осталась синей только там, где
     она действительно есть: Арал, Балхаш, Иссык-Куль, Каспий. */
  sea: "#efe9dc",
  seaDeep: "#e4dccb",
  land: "#e2d8bf",
  /* Подложка под Узбекистаном: чуть теплее соседей, чтобы страна
     читалась даже без трёхмерных призм. */
  homeland: "#e7dcc0",
  landEdge: "#bfb28f",
  landText: "#877c61",
  lake: "#8fbccf",
  lakeText: "#3f7186",
  ink: "#5f5641",
  gold: "#e9c46a",
  goldDeep: "#8a6a1c",
  uzEdge: "#20563d",
  edge: "#d7cbab",
  /* Торец выдавленной области — почти чёрный. Именно контраст светлой
     плоскости и тёмной стенки читается как объём, а не подкрашенный силуэт. */
  wall: "#161a17",
  cap: "#efeade",
  contour: "rgba(150,128,86,0.16)",
} as const;

const [SAND, MEADOW, FOREST] = RAMP.map((hex) => new THREE.Color(hex));

/** Песок → зелень. Цвет несёт ту же величину, что и высота призмы. */
export function shade(ratio: number): THREE.Color {
  return ratio < 0.5
    ? SAND.clone().lerp(MEADOW, ratio * 2)
    : MEADOW.clone().lerp(FOREST, (ratio - 0.5) * 2);
}

/** Луч вправо: нечётное число пересечений — точка внутри кольца. */
export function inRing(lon: number, lat: number, ring: [number, number][]): boolean {
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

/* ─────────────────────────── Шёлковый путь ─────────────────────────── */

/**
 * Точки за пределами страны: без них Узбекистан выглядит концом дороги,
 * а он был её серединой. Мерв и Кашгар — настоящие города Шёлкового пути
 * и попадают в кадр.
 */
export const GATEWAYS: Record<string, { lon: number; lat: number; name: Partial<Record<Lang, string>> }> = {
  merv: { lon: 62.19, lat: 37.66, name: { ru: "Мерв", uz: "Marv", en: "Merv" } },
  kashgar: { lon: 75.99, lat: 39.47, name: { ru: "Кашгар", uz: "Qashqar", en: "Kashgar" } },
};

/**
 * Ветви Великого шёлкового пути. Главная шла с запада от Мерва через Бухару
 * и Самарканд в Ферганскую долину и дальше в Кашгар; северная заходила в
 * Хорезм; южная поднималась от Термеза через Кеш.
 */
export const SILK_ROAD: string[][] = [
  ["merv", "bukhara", "samarkand", "tashkent", "fergana", "andijan", "kashgar"],
  ["khiva", "bukhara"],
  ["termez", "shakhrisabz", "samarkand"],
];


/* ─────────────────────────── Подписи воды ─────────────────────────── */

const WATER_NAME: Record<string, Partial<Record<Lang, string>>> = {
  "South Aral Sea": { ru: "Аральское море", uz: "Orol dengizi", en: "Aral Sea" },
  "Lake Balkhash": { ru: "Балхаш", uz: "Balxash", en: "Balkhash" },
  "Issyk-Kul": { ru: "Иссык-Куль", uz: "Issiqko'l", en: "Issyk-Kul" },
};

/**
 * Каспий в Natural Earth относится к океану, а не к озёрам, поэтому в слое
 * его нет: он получается сам из промежутка между сушей. Подпись ставим по
 * координате вручную.
 */
const CASPIAN: { lon: number; lat: number; name: Partial<Record<Lang, string>> } = {
  lon: 48.35,
  lat: 41.6,
  name: { ru: "Каспийское море", uz: "Kaspiy dengizi", en: "Caspian Sea" },
};

const NORTH_LETTER: Partial<Record<Lang, string>> = { ru: "С", uz: "Sh", en: "N" };
const KM_LABEL: Partial<Record<Lang, string>> = { ru: "км", uz: "km", en: "km" };

/* ─────────────────────────── Текстуры ─────────────────────────── */

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
/** Названия стран набраны засечным: так они читаются как печать на карте. */
const SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Подпись на светлой плашке: читается поверх любого рельефа. */
export function labelTexture(
  text: string,
  tone: "city" | "gate" = "city",
): { map: THREE.Texture; aspect: number } {
  const size = 46;
  const pad = 18;

  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = `600 ${size}px ${FONT}`;
  const w = Math.ceil(probe.measureText(text).width) + pad * 2;
  const h = size + pad * 2;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = tone === "city" ? "rgba(255,253,247,0.94)" : "rgba(250,244,230,0.82)";
  roundRect(ctx, 0, 0, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = tone === "city" ? "rgba(43,43,43,0.22)" : "rgba(138,106,28,0.35)";
  ctx.lineWidth = 2.5;
  roundRect(ctx, 1.5, 1.5, w - 3, h - 3, (h - 3) / 2);
  ctx.stroke();

  ctx.font = `600 ${size}px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = tone === "city" ? "#2b2b2b" : PALETTE.goldDeep;
  ctx.fillText(text, pad, h / 2 + 2);

  const map = new THREE.CanvasTexture(canvas);
  map.anisotropy = 4;
  return { map, aspect: w / h };
}

/**
 * Текстура боковой стенки плиты.
 *
 * В макете торец не однотонно чёрный: сверху он почти чёрный, книзу
 * разогревается до охры — как будто плита подсвечена снизу тёплым светом.
 * Это и даёт ощущение物 предмета, лежащего на столе, а не вырезанной фигуры.
 */
export function wallTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  // v = 0 у основания геометрии выдавливания, v = 1 у верхней грани.
  const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
  gradient.addColorStop(0, "#c98842");
  gradient.addColorStop(0.42, "#7a5426");
  gradient.addColorStop(0.72, "#241d16");
  gradient.addColorStop(1, "#12161a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

/**
 * Карта окружения целиком: море, суша соседей, крупные озёра, сетка,
 * подписи стран и воды, роза ветров и линейка масштаба.
 *
 * Ширина 2048 выбрана намеренно: 4096 дал бы вчетверо больше памяти под
 * текстуру (около сорока мегабайт), а выигрыш виден только вплотную —
 * вблизи зритель смотрит на Узбекистан, а он здесь настоящая геометрия,
 * а не картинка.
 */
export function atlasTexture(lang: Lang): THREE.Texture {
  const W = 2048;
  const H = Math.round((W * SHEET_H) / SHEET_W);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const xOf = (lon: number) => ((lon - BOX.minLon) / (BOX.maxLon - BOX.minLon)) * W;
  // Север сверху: широта растёт вверх, а координата холста — вниз.
  const yOf = (lat: number) => H - ((lat - BOX.minLat) / (BOX.maxLat - BOX.minLat)) * H;

  const trace = (ring: [number, number][]) => {
    ctx.beginPath();
    ring.forEach(([lon, lat], i) =>
      i ? ctx.lineTo(xOf(lon), yOf(lat)) : ctx.moveTo(xOf(lon), yOf(lat)),
    );
    ctx.closePath();
  };

  /* Море */
  const sea = ctx.createLinearGradient(0, 0, 0, H);
  sea.addColorStop(0, PALETTE.seaDeep);
  sea.addColorStop(0.5, PALETTE.sea);
  sea.addColorStop(1, PALETTE.seaDeep);
  ctx.fillStyle = sea;
  ctx.fillRect(0, 0, W, H);

  /* Горизонтали. Не настоящие изолинии — высот у нас нет; это фактура
     бумаги, по которой лист читается как картографический, а не как
     цветная подложка. Волны детерминированные, чтобы текстура не
     менялась между сборками. */
  ctx.strokeStyle = PALETTE.contour;
  ctx.lineWidth = 1.6;
  for (let ring = 0; ring < 26; ring++) {
    const base = (ring / 26) * H * 1.35 - H * 0.18;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 12) {
      const wave =
        Math.sin(x / 260 + ring * 0.7) * 26 +
        Math.sin(x / 90 + ring * 1.9) * 9 +
        Math.sin(x / 620 - ring * 0.4) * 44;
      const y = base + wave;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /* Суша соседей. Мягкая тень под берегом даёт ощущение высоты
     без единого дополнительного треугольника. */
  ctx.save();
  ctx.shadowColor = "rgba(60,80,85,0.30)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  for (const country of CONTEXT.countries) {
    for (const ring of country.rings) {
      trace(ring);
      ctx.fillStyle = PALETTE.land;
      ctx.fill();
    }
  }
  // Узбекистан исключён из слоя стран — его рисует геометрия. Но подложку
  // под ним всё равно нужно залить сушей: иначе под призмами остаётся море
  // и проглядывает в тот момент, когда регион приподнимается.
  for (const region of REGIONS) {
    trace(region.ring);
    ctx.fillStyle = PALETTE.homeland;
    ctx.fill();
  }
  ctx.restore();

  for (const country of CONTEXT.countries) {
    for (const ring of country.rings) {
      trace(ring);
      ctx.strokeStyle = PALETTE.landEdge;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  for (const region of REGIONS) {
    trace(region.ring);
    ctx.strokeStyle = "rgba(32,86,61,0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* Крупная вода поверх суши */
  for (const lake of CONTEXT.lakes) {
    trace(lake.ring);
    ctx.fillStyle = PALETTE.lake;
    ctx.fill();
    ctx.strokeStyle = "rgba(63,113,134,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* Сетка параллелей и меридианов — поверх всего, как на печатной карте.
     Под сушей она обрывалась бы, и лист выглядел бы склеенным из кусков. */
  for (let lon = Math.ceil(BOX.minLon); lon <= BOX.maxLon; lon += 2) {
    const major = lon % 10 === 0;
    ctx.strokeStyle = major ? "rgba(80,86,78,0.26)" : "rgba(80,86,78,0.11)";
    ctx.lineWidth = major ? 2.5 : 1.4;
    ctx.beginPath();
    ctx.moveTo(xOf(lon), 0);
    ctx.lineTo(xOf(lon), H);
    ctx.stroke();
  }
  for (let lat = Math.ceil(BOX.minLat); lat <= BOX.maxLat; lat += 2) {
    const major = lat % 10 === 0;
    ctx.strokeStyle = major ? "rgba(80,86,78,0.26)" : "rgba(80,86,78,0.11)";
    ctx.lineWidth = major ? 2.5 : 1.4;
    ctx.beginPath();
    ctx.moveTo(0, yOf(lat));
    ctx.lineTo(W, yOf(lat));
    ctx.stroke();
  }

  /* Подписи стран */
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "5px";
  ctx.fillStyle = PALETTE.landText;
  for (const country of CONTEXT.countries) {
    // Мелкие обрезки у края подписывать некуда.
    if (country.area < 5) continue;
    const name =
      lang === "ru" ? country.nameRu : lang === "uz" ? country.nameUz : country.nameEn;
    ctx.font = `italic 400 ${country.area > 40 ? 42 : 32}px ${SERIF}`;
    ctx.fillText(name.toUpperCase(), xOf(country.label[0]), yOf(country.label[1]));
  }

  /* Подписи воды */
  ctx.fillStyle = PALETTE.lakeText;
  ctx.font = `italic 500 26px ${FONT}`;
  ctx.letterSpacing = "3px";
  for (const lake of CONTEXT.lakes) {
    const name = lake.name ? WATER_NAME[lake.name]?.[lang] : undefined;
    if (!name) continue;
    let x = 0;
    let y = 0;
    for (const [lon, lat] of lake.ring) {
      x += xOf(lon);
      y += yOf(lat);
    }
    ctx.fillText(name, x / lake.ring.length, y / lake.ring.length);
  }
  // По центру подпись Каспия упиралась в рамку: море начинается у самого
  // края кадра. Ставим её от левого края внутрь воды.
  ctx.textAlign = "left";
  ctx.fillText(
    CASPIAN.name[lang] ?? CASPIAN.name.en!,
    xOf(CASPIAN.lon),
    yOf(CASPIAN.lat),
  );
  ctx.textAlign = "center";
  ctx.letterSpacing = "0px";

  /* Роза ветров */
  const cx = 168;
  const cy = H - 168;
  const r = 84;

  ctx.fillStyle = "rgba(252,248,238,0.88)";
  ctx.beginPath();
  ctx.arc(cx, cy, r + 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(95,86,65,0.30)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const long = i % 4 === 0;
    const from = r - (long ? 16 : 8);
    ctx.strokeStyle = "rgba(95,86,65,0.45)";
    ctx.lineWidth = long ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(a) * from, cy - Math.cos(a) * from);
    ctx.lineTo(cx + Math.sin(a) * r, cy - Math.cos(a) * r);
    ctx.stroke();
  }

  const needle = (up: boolean, fill: string) => {
    const dir = up ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy + dir * (r - 8));
    ctx.lineTo(cx - 20, cy);
    ctx.lineTo(cx + 20, cy);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };
  needle(true, PALETTE.gold);
  needle(false, "rgba(70,64,50,0.55)");

  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.ink;
  ctx.fill();

  ctx.font = `700 34px ${FONT}`;
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText(NORTH_LETTER[lang] ?? "N", cx, cy - r - 34);

  /* Линейка масштаба */
  const KM_PER_DEGREE_LAT = 111.32;
  const pxPerKm = H / (BOX.maxLat - BOX.minLat) / KM_PER_DEGREE_LAT;
  const barKm = 500;
  const barPx = barKm * pxPerKm;
  const bx = W - 110 - barPx;
  const by = H - 132;

  ctx.fillStyle = "rgba(252,248,238,0.85)";
  roundRect(ctx, bx - 26, by - 22, barPx + 52, 92, 14);
  ctx.fill();

  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.ink : "#f8f3e6";
    ctx.fillRect(bx + (barPx / 4) * i, by, barPx / 4, 15);
  }
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(bx, by, barPx, 15);

  ctx.font = `600 24px ${FONT}`;
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText("0", bx, by + 40);
  ctx.fillText(`${barKm / 2}`, bx + barPx / 2, by + 40);
  ctx.fillText(`${barKm} ${KM_LABEL[lang] ?? "km"}`, bx + barPx, by + 40);

  /* Рамка листа */
  ctx.strokeStyle = "rgba(95,86,65,0.35)";
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, W - 28, H - 28);

  const map = new THREE.CanvasTexture(canvas);
  map.anisotropy = 8;
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}
