"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import regions from "@/data/uzbekistan-regions.json";
import water from "@/data/uzbekistan-water.json";
import { t } from "@/lib/i18n";
import type { City, Lang } from "@/lib/types";

/**
 * Трёхмерная карта Узбекистана.
 *
 * Сцена собрана как картографический лист, а не как объёмная фигура: бумага
 * с координатной сеткой и рамкой, роза ветров, линейка масштаба, реки, озёра,
 * подписи городов. Регионы выдавлены призмами, высота и цвет пропорциональны
 * числу объектов в базе — рельеф показывает, где контента больше.
 *
 * Границы и вода — Natural Earth (public domain), упрощены алгоритмом
 * Дугласа–Пекера: вся страна занимает около 20 КБ, потому что эти файлы
 * попадают в офлайн-пакет.
 *
 * Стрелки Шёлкового пути — не украшение: они показывают, почему города стоят
 * именно так и в каком порядке их логично смотреть.
 */

interface Region {
  city: string;
  extra: string[];
  nameRu: string;
  ring: [number, number][];
}

interface Water {
  rivers: { name: string | null; path: [number, number][] }[];
  lakes: { name: string | null; ring: [number, number][] }[];
}

const DATA = regions as Region[];
const WATER = water as Water;

/* ─────────────────────────── Проекция ─────────────────────────── */

const BOUNDS = (() => {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const r of DATA) {
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
 * составляет лишь cos(41°) ≈ 0,75 градуса широты. Именно из-за этого карта
 * выглядела знакомо-неправильной.
 */
const LON_SQUEEZE = Math.cos((MID_LAT * Math.PI) / 180);

/** Ширина страны в единицах сцены. Всё остальное считается от неё. */
const WIDTH = 14;
const SCALE = WIDTH / ((BOUNDS.maxLon - BOUNDS.minLon) * LON_SQUEEZE);

/** Градусы → координаты плоской фигуры, которую потом кладут в горизонт. */
function project(lon: number, lat: number): [number, number] {
  return [(lon - MID_LON) * LON_SQUEEZE * SCALE, (lat - MID_LAT) * SCALE];
}

/**
 * Градусы → точка сцены. Фигуры поворачиваются на -90° вокруг X, поэтому
 * север смотрит в -Z, а высота идёт по Y.
 */
function world(lon: number, lat: number, y = 0): THREE.Vector3 {
  const [x, z] = project(lon, lat);
  return new THREE.Vector3(x, y, -z);
}

/** Поля вокруг страны, чтобы лист не обрезал границу вплотную. */
const MARGIN_DEG = 0.7;
const SHEET = {
  minLon: BOUNDS.minLon - MARGIN_DEG,
  maxLon: BOUNDS.maxLon + MARGIN_DEG,
  minLat: BOUNDS.minLat - MARGIN_DEG,
  maxLat: BOUNDS.maxLat + MARGIN_DEG,
};
const SHEET_W = (SHEET.maxLon - SHEET.minLon) * LON_SQUEEZE * SCALE;
const SHEET_H = (SHEET.maxLat - SHEET.minLat) * SCALE;

/* ─────────────────────────── Рельеф ─────────────────────────── */

const MIN_HEIGHT = 0.22;
const MAX_RISE = 1.5;

function inRing(lon: number, lat: number, ring: [number, number][]): boolean {
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

const SAND = new THREE.Color("#e3d3a8");
const MEADOW = new THREE.Color("#8ec19c");
const FOREST = new THREE.Color("#2e7d5a");
const GOLD = "#e9c46a";

/** Песок → зелень. Цвет несёт ту же величину, что и высота. */
function shade(ratio: number): THREE.Color {
  return ratio < 0.5
    ? SAND.clone().lerp(MEADOW, ratio * 2)
    : MEADOW.clone().lerp(FOREST, (ratio - 0.5) * 2);
}

/* ─────────────────────────── Текстуры ─────────────────────────── */

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Подпись города: текст на светлой плашке, читается поверх любого рельефа. */
function labelTexture(text: string): { map: THREE.Texture; aspect: number } {
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

  ctx.fillStyle = "rgba(255,253,247,0.92)";
  roundRect(ctx, 0, 0, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(43,43,43,0.22)";
  ctx.lineWidth = 2.5;
  roundRect(ctx, 1.5, 1.5, w - 3, h - 3, (h - 3) / 2);
  ctx.stroke();

  ctx.font = `600 ${size}px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#2b2b2b";
  ctx.fillText(text, pad, h / 2 + 2);

  const map = new THREE.CanvasTexture(canvas);
  map.anisotropy = 4;
  return { map, aspect: w / h };
}

/**
 * Бумага карты: сетка параллелей и меридианов, рамка, роза ветров и линейка
 * масштаба. Всё нарисовано в одну текстуру — это не стоит ни одного лишнего
 * объекта в сцене и при этом читается как напечатанная карта.
 */
function sheetTexture(north: string, kmLabel: string): THREE.Texture {
  const W = 2048;
  const H = Math.round((W * SHEET_H) / SHEET_W);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const xOf = (lon: number) =>
    ((lon - SHEET.minLon) / (SHEET.maxLon - SHEET.minLon)) * W;
  // Север сверху: широта растёт вверх, а координата холста — вниз.
  const yOf = (lat: number) =>
    H - ((lat - SHEET.minLat) / (SHEET.maxLat - SHEET.minLat)) * H;

  ctx.fillStyle = "#f8f3e6";
  ctx.fillRect(0, 0, W, H);

  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.95);
  vignette.addColorStop(0, "rgba(255,255,255,0)");
  vignette.addColorStop(1, "rgba(150,130,90,0.16)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  ctx.font = `500 18px ${FONT}`;
  ctx.textBaseline = "top";

  for (let lon = Math.ceil(SHEET.minLon); lon <= SHEET.maxLon; lon++) {
    const major = lon % 5 === 0;
    ctx.strokeStyle = major ? "rgba(46,125,90,0.20)" : "rgba(46,125,90,0.09)";
    ctx.lineWidth = major ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(xOf(lon), 0);
    ctx.lineTo(xOf(lon), H);
    ctx.stroke();
    if (major) {
      ctx.fillStyle = "rgba(90,80,55,0.55)";
      ctx.fillText(`${lon}°`, xOf(lon) + 8, 44);
    }
  }

  for (let lat = Math.ceil(SHEET.minLat); lat <= SHEET.maxLat; lat++) {
    const major = lat % 5 === 0;
    ctx.strokeStyle = major ? "rgba(46,125,90,0.20)" : "rgba(46,125,90,0.09)";
    ctx.lineWidth = major ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(0, yOf(lat));
    ctx.lineTo(W, yOf(lat));
    ctx.stroke();
    if (major) {
      ctx.fillStyle = "rgba(90,80,55,0.55)";
      ctx.fillText(`${lat}°`, 44, yOf(lat) + 8);
    }
  }

  ctx.strokeStyle = "#cbbf9f";
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 38, W - 76, H - 76);

  /* Роза ветров — в юго-западном углу, страна туда не заходит. */
  const cx = 150;
  const cy = H - 150;
  const r = 82;

  ctx.fillStyle = "rgba(255,253,247,0.85)";
  ctx.beginPath();
  ctx.arc(cx, cy, r + 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(90,80,55,0.35)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const long = i % 4 === 0;
    const from = r - (long ? 16 : 8);
    ctx.strokeStyle = "rgba(90,80,55,0.45)";
    ctx.lineWidth = long ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(a) * from, cy - Math.cos(a) * from);
    ctx.lineTo(cx + Math.sin(a) * r, cy - Math.cos(a) * r);
    ctx.stroke();
  }

  // Стрелка на север: золотая половина вверх, тёмная вниз.
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
  needle(true, GOLD);
  needle(false, "rgba(70,64,50,0.55)");

  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fillStyle = "#5f5641";
  ctx.fill();

  ctx.font = `700 34px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#5f5641";
  ctx.fillText(north, cx, cy - r - 36);

  /* Линейка масштаба — в юго-восточном углу. */
  const KM_PER_DEGREE_LAT = 111.32;
  const pxPerKm = H / (SHEET.maxLat - SHEET.minLat) / KM_PER_DEGREE_LAT;
  const barKm = 200;
  const barPx = barKm * pxPerKm;
  const bx = W - 90 - barPx;
  const by = H - 120;

  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#5f5641" : "#f8f3e6";
    ctx.fillRect(bx + (barPx / 4) * i, by, barPx / 4, 16);
  }
  ctx.strokeStyle = "#5f5641";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(bx, by, barPx, 16);

  ctx.font = `600 24px ${FONT}`;
  ctx.fillStyle = "#5f5641";
  ctx.fillText("0", bx, by + 40);
  ctx.fillText(`${barKm / 2}`, bx + barPx / 2, by + 40);
  ctx.fillText(`${barKm} ${kmLabel}`, bx + barPx, by + 40);

  const map = new THREE.CanvasTexture(canvas);
  map.anisotropy = 8;
  return map;
}

/* ─────────────────────────── Слои сцены ─────────────────────────── */

function MapSheet({ north, kmLabel }: { north: string; kmLabel: string }) {
  const map = useMemo(() => sheetTexture(north, kmLabel), [north, kmLabel]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[SHEET_W, SHEET_H]} />
      <meshStandardMaterial map={map} roughness={0.95} metalness={0} />
    </mesh>
  );
}

function RegionMesh({
  region,
  height,
  ratio,
  active,
  onHover,
  onSelect,
}: {
  region: Region;
  height: number;
  ratio: number;
  active: boolean;
  onHover: (city: string | null) => void;
  onSelect: (city: string) => void;
}) {
  const group = useRef<THREE.Group>(null);

  const { solid, outline } = useMemo(() => {
    const shape = new THREE.Shape();
    region.ring.forEach(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();

    const solid = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelSize: 0.018,
      bevelThickness: 0.018,
      bevelSegments: 1,
    });
    solid.rotateX(-Math.PI / 2);
    solid.computeVertexNormals();

    // Контур по верхней грани: именно он превращает силуэт в карту.
    const outline = new THREE.BufferGeometry().setFromPoints(
      region.ring.map(([lon, lat]) => world(lon, lat, height + 0.012)),
    );

    return { solid, outline };
  }, [region, height]);

  const color = useMemo(() => shade(ratio), [ratio]);

  // Активный регион приподнимается: это заметно и без цвета, а значит
  // работает при дальтонизме и на солнце.
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = active ? 0.28 : 0;
    group.current.position.y += (target - group.current.position.y) * Math.min(1, delta * 9);
  });

  return (
    <group ref={group}>
      <mesh
        geometry={solid}
        castShadow
        receiveShadow
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(region.city);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(region.city);
        }}
      >
        <meshStandardMaterial
          color={active ? GOLD : color}
          roughness={active ? 0.34 : 0.72}
          metalness={0.06}
          emissive={active ? GOLD : "#000000"}
          emissiveIntensity={active ? 0.22 : 0}
        />
      </mesh>

      <lineLoop geometry={outline}>
        <lineBasicMaterial color={active ? "#7a5c12" : "#20563d"} transparent opacity={0.55} />
      </lineLoop>
    </group>
  );
}

const WATER_COLOR = "#5b9bb5";

function Rivers({ heightAt }: { heightAt: (lon: number, lat: number) => number }) {
  const parts = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (const river of WATER.rivers) {
      // Совпадающие подряд точки дают нулевую касательную, а с ней —
      // NaN в геометрии трубки, и участок реки просто пропадает.
      const points: THREE.Vector3[] = [];
      for (const [lon, lat] of river.path) {
        const point = world(lon, lat, heightAt(lon, lat) + 0.035);
        const previous = points[points.length - 1];
        if (!previous || previous.distanceToSquared(point) > 1e-8) points.push(point);
      }
      if (points.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(points);
      out.push(new THREE.TubeGeometry(curve, points.length * 6, 0.042, 6, false));
    }
    return out;
  }, [heightAt]);

  return (
    <>
      {parts.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshStandardMaterial color={WATER_COLOR} roughness={0.25} metalness={0.25} />
        </mesh>
      ))}
    </>
  );
}

function Lakes({ heightAt }: { heightAt: (lon: number, lat: number) => number }) {
  const parts = useMemo(
    () =>
      WATER.lakes.map((lake) => {
        const shape = new THREE.Shape();
        lake.ring.forEach(([lon, lat], i) => {
          const [x, y] = project(lon, lat);
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        });
        shape.closePath();

        // Озеро лежит на высоте своего региона, иначе оно утонет в призме.
        const mid = lake.ring[Math.floor(lake.ring.length / 2)];
        const y = heightAt(mid[0], mid[1]) + 0.03;

        const geometry = new THREE.ShapeGeometry(shape);
        geometry.rotateX(-Math.PI / 2);
        geometry.translate(0, y, 0);
        return geometry;
      }),
    [heightAt],
  );

  return (
    <>
      {parts.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshStandardMaterial
            color={WATER_COLOR}
            roughness={0.2}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * Ветви Великого шёлкового пути: северная — через Хорезм, Бухару и Самарканд
 * в Ферганскую долину и дальше в Китай; южная — от Термеза через Кеш
 * (Шахрисабз) навстречу первой. Города стоят на этих линиях не случайно.
 */
const SILK_ROAD: string[][] = [
  ["khiva", "bukhara", "samarkand", "tashkent", "fergana", "andijan"],
  ["termez", "shakhrisabz", "samarkand"],
];

const ARROWS_PER_ROUTE = 3;
const ARROW_SPEED = 0.045;

function SilkRoad({ cityAt }: { cityAt: (slug: string) => THREE.Vector3 | null }) {
  const curves = useMemo(() => {
    const built: THREE.CatmullRomCurve3[] = [];

    for (const route of SILK_ROAD) {
      const stops = route.map(cityAt).filter((p): p is THREE.Vector3 => p !== null);
      if (stops.length < 2) continue;

      // Между городами поднимаем промежуточную точку — дуга отрывается
      // от рельефа и читается как направление, а не как ещё одна граница.
      const points: THREE.Vector3[] = [];
      stops.forEach((stop, i) => {
        points.push(stop.clone().setY(stop.y + 0.3));
        const next = stops[i + 1];
        if (next) {
          const mid = stop.clone().lerp(next, 0.5);
          mid.y = Math.max(stop.y, next.y) + 0.75;
          points.push(mid);
        }
      });

      built.push(new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.35));
    }

    return built;
  }, [cityAt]);

  const arrows = useRef<THREE.Mesh[]>([]);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    arrows.current.forEach((arrow, i) => {
      if (!arrow) return;
      const curve = curves[Math.floor(i / ARROWS_PER_ROUTE)];
      if (!curve) return;

      const offset = (i % ARROWS_PER_ROUTE) / ARROWS_PER_ROUTE;
      const at = (time * ARROW_SPEED + offset) % 1;

      arrow.position.copy(curve.getPointAt(at));
      arrow.quaternion.setFromUnitVectors(up, curve.getTangentAt(at).normalize());

      // Гасим у краёв, чтобы стрелка появлялась и исчезала, а не мигала.
      const fade = Math.min(1, Math.min(at, 1 - at) * 12);
      (arrow.material as THREE.MeshStandardMaterial).opacity = fade;
    });
  });

  return (
    <>
      {curves.map((curve, i) => (
        <mesh key={`path-${i}`}>
          <tubeGeometry args={[curve, 140, 0.022, 6, false]} />
          <meshStandardMaterial
            color={GOLD}
            emissive={GOLD}
            emissiveIntensity={0.5}
            roughness={0.35}
            metalness={0.4}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}

      {curves.flatMap((_, routeIndex) =>
        Array.from({ length: ARROWS_PER_ROUTE }, (_, k) => {
          const index = routeIndex * ARROWS_PER_ROUTE + k;
          return (
            <mesh
              key={`arrow-${index}`}
              ref={(node) => {
                if (node) arrows.current[index] = node;
              }}
            >
              <coneGeometry args={[0.08, 0.26, 10]} />
              <meshStandardMaterial
                color={GOLD}
                emissive={GOLD}
                emissiveIntensity={0.8}
                roughness={0.3}
                metalness={0.5}
                transparent
              />
            </mesh>
          );
        }),
      )}
    </>
  );
}

/**
 * Короткие имена для карты.
 *
 * В базе города названы описательно — «Нукус и Каракалпакстан», «Джизак
 * и Заминские горы»: так они читаются в списке. На карте нужен топоним,
 * иначе подписи наезжают друг на друга, и Ферганская долина, где три
 * города стоят рядом, становится нечитаемой.
 */
const SHORT_NAME: Record<string, Partial<Record<Lang, string>>> = {
  nukus: { ru: "Нукус", uz: "Nukus", en: "Nukus" },
  khiva: { ru: "Хива", uz: "Xiva", en: "Khiva" },
  bukhara: { ru: "Бухара", uz: "Buxoro", en: "Bukhara" },
  navoi: { ru: "Навои", uz: "Navoiy", en: "Navoi" },
  samarkand: { ru: "Самарканд", uz: "Samarqand", en: "Samarkand" },
  shakhrisabz: { ru: "Шахрисабз", uz: "Shahrisabz", en: "Shakhrisabz" },
  karshi: { ru: "Карши", uz: "Qarshi", en: "Karshi" },
  termez: { ru: "Термез", uz: "Termiz", en: "Termez" },
  jizzakh: { ru: "Джизак", uz: "Jizzax", en: "Jizzakh" },
  gulistan: { ru: "Гулистан", uz: "Guliston", en: "Gulistan" },
  tashkent: { ru: "Ташкент", uz: "Toshkent", en: "Tashkent" },
  fergana: { ru: "Фергана", uz: "Farg'ona", en: "Fergana" },
  namangan: { ru: "Наманган", uz: "Namangan", en: "Namangan" },
  andijan: { ru: "Андижан", uz: "Andijon", en: "Andijan" },
};

/** Топоним для подписи, с откатом на название из базы. */
function shortName(city: City, lang: Lang): string {
  return SHORT_NAME[city.slug]?.[lang] ?? city.name;
}

function CityMarkers({
  cities,
  cityAt,
  lang,
  onSelect,
}: {
  cities: City[];
  cityAt: (slug: string) => THREE.Vector3 | null;
  lang: Lang;
  onSelect: (city: string) => void;
}) {
  const labels = useMemo(
    () => new Map(cities.map((c) => [c.slug, labelTexture(shortName(c, lang))])),
    [cities, lang],
  );

  return (
    <>
      {cities.map((city) => {
        const base = cityAt(city.slug);
        const label = labels.get(city.slug);
        if (!base || !label) return null;

        return (
          <group key={city.slug} position={base}>
            <mesh position={[0, 0.16, 0]} onClick={() => onSelect(city.slug)}>
              <cylinderGeometry args={[0.012, 0.012, 0.32, 6]} />
              <meshStandardMaterial color="#8a6a1c" roughness={0.5} />
            </mesh>

            <mesh position={[0, 0.36, 0]} castShadow onClick={() => onSelect(city.slug)}>
              <sphereGeometry args={[0.062, 14, 14]} />
              <meshStandardMaterial
                color={GOLD}
                emissive={GOLD}
                emissiveIntensity={0.35}
                roughness={0.3}
                metalness={0.4}
              />
            </mesh>

            <sprite position={[0, 0.62, 0]} scale={[0.34 * label.aspect, 0.34, 1]}>
              <spriteMaterial map={label.map} transparent depthWrite={false} />
            </sprite>
          </group>
        );
      })}
    </>
  );
}

/**
 * Медленный облёт страны. Останавливается при наведении: целиться
 * в движущуюся мишень невозможно.
 */
function CameraRig({ paused }: { paused: boolean }) {
  const { camera, pointer } = useThree();
  const angle = useRef(0);
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const wanted = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!paused) angle.current += delta * 0.06;

    const radius = 15.5;
    wanted.set(
      Math.sin(angle.current) * radius + pointer.x * 1.4,
      10.5 + pointer.y * 1.2,
      Math.cos(angle.current) * radius,
    );

    camera.position.lerp(wanted, 0.05);
    camera.lookAt(target);
  });

  return null;
}

/** R3F измеряет холст сам, но не всегда успевает к первому кадру. */
function FitToParent() {
  const gl = useThree((s) => s.gl);
  const setSize = useThree((s) => s.setSize);
  const done = useRef(false);

  useFrame(() => {
    if (done.current) return;
    const parent = gl.domElement.parentElement;
    if (!parent) return;

    const { width, height } = parent.getBoundingClientRect();
    if (width > 0 && height > 0) {
      setSize(width, height);
      done.current = true;
    }
  });

  return null;
}

/* ─────────────────────────── Карта ─────────────────────────── */

const NORTH_LETTER: Partial<Record<Lang, string>> = { ru: "С", uz: "Sh", en: "N" };
const KM_LABEL: Partial<Record<Lang, string>> = { ru: "км", uz: "km", en: "km" };

export default function RegionMap3D({
  cities,
  counts,
  lang,
  onSelect,
  className = "",
}: {
  cities: City[];
  /** Сколько объектов в каждом городе — задаёт высоту и цвет региона. */
  counts: Record<string, number>;
  lang: Lang;
  onSelect: (city: string) => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  /**
   * Вес региона — объекты самого города плюс те, что отнесены к нему
   * отдельными списками: Шахрисабз считается вместе с Кашкадарьёй, иначе
   * область выглядит пустой при живом городе внутри.
   */
  const weights = useMemo(() => {
    const out: Record<string, number> = {};
    for (const region of DATA) {
      out[region.city] =
        (counts[region.city] ?? 0) +
        region.extra.reduce((sum, slug) => sum + (counts[slug] ?? 0), 0);
    }
    return out;
  }, [counts]);

  const maxWeight = Math.max(1, ...Object.values(weights));

  const heights = useMemo(() => {
    const out: Record<string, number> = {};
    for (const region of DATA) {
      out[region.city] = MIN_HEIGHT + (weights[region.city] / maxWeight) * MAX_RISE;
    }
    return out;
  }, [weights, maxWeight]);

  const heightAt = useMemo(() => {
    return (lon: number, lat: number) => {
      const region = DATA.find((r) => inRing(lon, lat, r.ring));
      return region ? heights[region.city] : 0;
    };
  }, [heights]);

  const cityAt = useMemo(() => {
    const bySlug = new Map(cities.map((c) => [c.slug, c]));
    return (slug: string) => {
      const city = bySlug.get(slug);
      if (!city) return null;
      return world(city.lon, city.lat, heightAt(city.lon, city.lat));
    };
  }, [cities, heightAt]);

  const hoveredRegion = hovered ? DATA.find((r) => r.city === hovered) : null;
  const hoveredCity = hovered ? cities.find((c) => c.slug === hovered) : null;

  return (
    <div className={`relative ${className}`}>
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 10.5, 15.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <hemisphereLight args={["#fff6e6", "#c9c2a8", 0.6]} />
        <directionalLight
          position={[7, 13, 5]}
          intensity={1.8}
          color="#fff4de"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
        />
        <directionalLight position={[-9, 6, -7]} intensity={0.45} color="#8fd0ae" />

        <MapSheet north={NORTH_LETTER[lang] ?? "N"} kmLabel={KM_LABEL[lang] ?? "km"} />

        {DATA.map((region) => (
          <RegionMesh
            key={region.city}
            region={region}
            height={heights[region.city]}
            ratio={weights[region.city] / maxWeight}
            active={hovered === region.city}
            onHover={setHovered}
            onSelect={onSelect}
          />
        ))}

        <Rivers heightAt={heightAt} />
        <Lakes heightAt={heightAt} />
        <SilkRoad cityAt={cityAt} />
        <CityMarkers cities={cities} cityAt={cityAt} lang={lang} onSelect={onSelect} />

        <CameraRig paused={hovered !== null} />
        <FitToParent />
      </Canvas>

      {/* Легенда: без неё шкала и золотая линия просто красивые. */}
      <div
        className="pointer-events-none absolute left-3 top-3 rounded-[var(--radius-sm)] px-3 py-2 text-[11px]"
        style={{
          background: "color-mix(in srgb, var(--surface) 78%, transparent)",
          backdropFilter: "blur(10px)",
          border: "1px solid var(--border)",
          color: "var(--text-soft)",
        }}
      >
        <div className="flex items-center gap-2">
          <span>{t(lang, "map_less")}</span>
          <span
            className="h-2 w-16 rounded-full"
            style={{ background: "linear-gradient(90deg,#e3d3a8,#8ec19c,#2e7d5a)" }}
          />
          <span>{t(lang, "map_more")}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-0.5 w-8 rounded-full" style={{ background: GOLD }} />
          <span>{t(lang, "map_silk_road")}</span>
        </div>
      </div>

      {hoveredRegion && (
        <div
          className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-[var(--radius-md)] px-4 py-3"
          style={{
            background: "color-mix(in srgb, var(--surface) 74%, transparent)",
            backdropFilter: "blur(14px)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-2)",
          }}
        >
          <p className="font-semibold">{hoveredCity?.name ?? hoveredRegion.nameRu}</p>
          <p className="text-sm soft">
            {weights[hoveredRegion.city]} {t(lang, "objects")} · {t(lang, "map_open")}
          </p>
        </div>
      )}
    </div>
  );
}
