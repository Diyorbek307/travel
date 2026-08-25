"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  GATEWAYS,
  PALETTE,
  REGIONS,
  SHEET_CENTER,
  SHEET_H,
  SHEET_THICKNESS,
  SHEET_W,
  SILK_ROAD,
  UZ_WATER,
  atlasTexture,
  wallTexture,
  inRing,
  labelTexture,
  project,
  shade,
  world,
} from "@/lib/map-atlas";
import { SHORT_NAME } from "@/lib/city-names";
import { RAMP_CSS } from "@/lib/map-palette";
import { objectsCount, t } from "@/lib/i18n";
import type { City, Lang } from "@/lib/types";

/**
 * Трёхмерная карта Узбекистана в окружении региона.
 *
 * Страна — настоящая геометрия: призмы регионов, высота и цвет которых
 * пропорциональны числу объектов в базе. Всё остальное — море, соседние
 * страны, Каспий, Арал, Балхаш, сетка, роза ветров — запечено в текстуру
 * основания одним листом (см. lib/map-atlas).
 *
 * Так решается главная задача: силуэт одного Узбекистана узнаёт только тот,
 * кто и так знает, как он выглядит. Туристу нужна привязка к миру.
 *
 * Камера управляется мышью и пальцем; сама по себе она медленно облетает
 * страну и останавливается, как только зритель берёт управление.
 */

/**
 * Толщина плит.
 *
 * Раньше разброс доходил до 1,55 единицы, и тёмные торцы превращались в
 * чёрные скалы: объём перекрывал саму карту. В макете это тонкая кромка,
 * поэтому и высоты сжаты — разница между областями остаётся читаемой,
 * но перестаёт быть главным, что видно на экране.
 */
const MIN_HEIGHT = 0.26;
const MAX_RISE = 0.5;

/* ─────────────────────────── Управление ─────────────────────────── */

/** Через сколько простоя карта снова начинает вращаться сама. */
const IDLE_BEFORE_SPIN = 5000;

function Controls() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  const controls = useMemo(
    () => new OrbitControls(camera, gl.domElement),
    [camera, gl],
  );

  useEffect(() => {
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.7;
    controls.panSpeed = 0.6;
    controls.minDistance = 9;
    controls.maxDistance = 42;
    // Под карту заглядывать незачем, а почти отвесный вид ломает подписи.
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2.12;
    controls.screenSpacePanning = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.32;
    controls.target.set(0, 0, 0);

    let idle: number | undefined;
    const stop = () => {
      controls.autoRotate = false;
      window.clearTimeout(idle);
    };
    const resume = () => {
      idle = window.setTimeout(() => {
        controls.autoRotate = true;
      }, IDLE_BEFORE_SPIN);
    };

    controls.addEventListener("start", stop);
    controls.addEventListener("end", resume);

    return () => {
      controls.removeEventListener("start", stop);
      controls.removeEventListener("end", resume);
      window.clearTimeout(idle);
      controls.dispose();
    };
  }, [controls]);

  useFrame(() => controls.update());
  return null;
}

/* ─────────────────────────── Основание ─────────────────────────── */

function MapBoard({ lang }: { lang: Lang }) {
  const atlas = useMemo(() => atlasTexture(lang), [lang]);

  useEffect(() => () => atlas.dispose(), [atlas]);

  return (
    <group position={[SHEET_CENTER.x, 0, SHEET_CENTER.z]}>
      {/* Лицо карты. Плоскость, а не верхняя грань коробки: у повёрнутой
          плоскости направление текстуры однозначно, север точно вверху. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SHEET_W, SHEET_H]} />
        <meshStandardMaterial map={atlas} roughness={0.94} metalness={0} />
      </mesh>

      {/* Торец: карта — плита, а не наклейка. Тень от неё даёт опору всей сцене. */}
      <mesh position={[0, -SHEET_THICKNESS / 2 - 0.002, 0]} castShadow receiveShadow>
        <boxGeometry args={[SHEET_W, SHEET_THICKNESS, SHEET_H]} />
        <meshStandardMaterial color={PALETTE.edge} roughness={0.9} metalness={0} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────── Регионы ─────────────────────────── */

function RegionMesh({
  region,
  height,
  ratio,
  active,
  onHover,
  onSelect,
}: {
  region: (typeof REGIONS)[number];
  height: number;
  ratio: number;
  active: boolean;
  onHover: (city: string | null) => void;
  onSelect: (city: string) => void;
}) {
  const group = useRef<THREE.Group>(null);

  const { solid, outline } = useMemo(() => {
    /*
     * Плиты стоят с зазором, как в макете: каждая ужимается к собственному
     * центру на процент с небольшим. Без этого области смыкаются вплотную,
     * тёмные торцы сливаются в одну стенку, и вместо набора плит получается
     * сплошной массив с трещинами.
     */
    const flat = region.ring.map(([lon, lat]) => project(lon, lat));
    const cx = flat.reduce((sum, p) => sum + p[0], 0) / flat.length;
    const cy = flat.reduce((sum, p) => sum + p[1], 0) / flat.length;
    const GAP = 0.986;
    const points = flat.map(([x, y]) => [
      cx + (x - cx) * GAP,
      cy + (y - cy) * GAP,
    ] as [number, number]);

    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => {
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();

    const solid = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 1,
    });
    solid.rotateX(-Math.PI / 2);
    solid.computeVertexNormals();

    // Контур по верхней грани — по тем же ужатым точкам, иначе он повиснет
    // над зазором.
    const outline = new THREE.BufferGeometry().setFromPoints(
      points.map(([x, y]) => new THREE.Vector3(x, height + 0.012, -y)),
    );

    return { solid, outline };
  }, [region, height]);

  useEffect(
    () => () => {
      solid.dispose();
      outline.dispose();
    },
    [solid, outline],
  );

  const color = useMemo(() => shade(ratio), [ratio]);

  const materials = useMemo(() => {
    const cap = new THREE.MeshStandardMaterial({
      color: active ? new THREE.Color(PALETTE.gold) : color,
      roughness: active ? 0.32 : 0.66,
      metalness: 0.06,
      emissive: new THREE.Color(active ? PALETTE.gold : "#000000"),
      emissiveIntensity: active ? 0.22 : 0,
    });
    const wall = new THREE.MeshStandardMaterial({
      map: wallTexture(),
      roughness: 0.8,
      metalness: 0.04,
    });
    return [cap, wall];
  }, [color, active]);

  useEffect(
    () => () => materials.forEach((m) => m.dispose()),
    [materials],
  );

  // Активный регион приподнимается: это заметно и без цвета, а значит
  // работает при дальтонизме и на солнце.
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = active ? 0.16 : 0;
    group.current.position.y += (target - group.current.position.y) * Math.min(1, delta * 9);
  });

  return (
    <group ref={group}>
      {/* ExtrudeGeometry сама делит поверхность на две группы: крышки и
          боковые стенки. Пользуемся этим — светлая плоскость и почти чёрный
          торец. Именно этот контраст читается как объём, а не подкрашенный
          силуэт; цвет по количеству объектов остаётся на крышке. */}
      <mesh
        geometry={solid}
        material={materials}
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
      />

      <lineLoop geometry={outline}>
        <lineBasicMaterial
          color={active ? PALETTE.goldDeep : PALETTE.uzEdge}
          transparent
          opacity={0.6}
        />
      </lineLoop>
    </group>
  );
}

/* ─────────────────────────── Вода страны ─────────────────────────── */

function UzRivers({ heightAt }: { heightAt: (lon: number, lat: number) => number }) {
  const parts = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (const river of UZ_WATER.rivers) {
      // Совпадающие подряд точки дают нулевую касательную, а с ней — NaN
      // в геометрии трубки, и участок реки просто пропадает.
      const points: THREE.Vector3[] = [];
      for (const [lon, lat] of river.path) {
        const point = world(lon, lat, heightAt(lon, lat) + 0.035);
        const previous = points[points.length - 1];
        if (!previous || previous.distanceToSquared(point) > 1e-8) points.push(point);
      }
      if (points.length < 2) continue;

      const curve = new THREE.CatmullRomCurve3(points);
      out.push(new THREE.TubeGeometry(curve, points.length * 6, 0.04, 6, false));
    }
    return out;
  }, [heightAt]);

  useEffect(() => () => parts.forEach((p) => p.dispose()), [parts]);

  return (
    <>
      {parts.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshStandardMaterial color={PALETTE.lake} roughness={0.22} metalness={0.3} />
        </mesh>
      ))}
    </>
  );
}

function UzLakes({ heightAt }: { heightAt: (lon: number, lat: number) => number }) {
  const parts = useMemo(
    () =>
      UZ_WATER.lakes.map((lake) => {
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

  useEffect(() => () => parts.forEach((p) => p.dispose()), [parts]);

  return (
    <>
      {parts.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshStandardMaterial
            color={PALETTE.lake}
            roughness={0.2}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

/* ─────────────────────────── Шёлковый путь ─────────────────────────── */

const ARROWS_PER_ROUTE = 3;
const ARROW_SPEED = 0.04;

function SilkRoad({ pointAt }: { pointAt: (slug: string) => THREE.Vector3 | null }) {
  const curves = useMemo(() => {
    const built: THREE.CatmullRomCurve3[] = [];

    for (const route of SILK_ROAD) {
      const stops = route.map(pointAt).filter((p): p is THREE.Vector3 => p !== null);
      if (stops.length < 2) continue;

      // Между городами поднимаем промежуточную точку — дуга отрывается
      // от рельефа и читается как направление, а не как ещё одна граница.
      const points: THREE.Vector3[] = [];
      stops.forEach((stop, i) => {
        points.push(stop.clone().setY(stop.y + 0.3));
        const next = stops[i + 1];
        if (next) {
          const mid = stop.clone().lerp(next, 0.5);
          mid.y = Math.max(stop.y, next.y) + 0.7;
          points.push(mid);
        }
      });

      built.push(new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.35));
    }

    return built;
  }, [pointAt]);

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
          <tubeGeometry args={[curve, 160, 0.022, 6, false]} />
          <meshStandardMaterial
            color={PALETTE.gold}
            emissive={PALETTE.gold}
            emissiveIntensity={0.5}
            roughness={0.35}
            metalness={0.4}
            transparent
            opacity={0.7}
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
                color={PALETTE.gold}
                emissive={PALETTE.gold}
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

/* ─────────────────────────── Метки ─────────────────────────── */

/**
 * Сколько городов получают выноску с подписью.
 *
 * В макете подписаны единицы. Четырнадцать выносок сразу превращают карту
 * в частокол золотых столбов: подписи наезжают, а сама страна теряется.
 * Остальные города остаются точками и называются при наведении.
 */
const LABELLED = 6;

function CityMarkers({
  cities,
  counts,
  pointAt,
  lang,
  onSelect,
}: {
  cities: City[];
  counts: Record<string, number>;
  pointAt: (slug: string) => THREE.Vector3 | null;
  lang: Lang;
  onSelect: (city: string) => void;
}) {
  const labelled = useMemo(
    () =>
      new Set(
        [...cities]
          .sort((a, b) => (counts[b.slug] ?? 0) - (counts[a.slug] ?? 0))
          .slice(0, LABELLED)
          .map((c) => c.slug),
      ),
    [cities, counts],
  );
  const labels = useMemo(
    () =>
      new Map(
        cities.map((c) => [c.slug, labelTexture(SHORT_NAME[c.slug]?.[lang] ?? c.name)]),
      ),
    [cities, lang],
  );

  useEffect(
    () => () => labels.forEach((l) => l.map.dispose()),
    [labels],
  );

  const heads = useRef<THREE.Object3D[]>([]);

  // Еле заметное дыхание меток: карта не выглядит замершей картинкой,
  // но и не мельтешит. Фаза у каждой своя, иначе получится пульс сердца.
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    heads.current.forEach((head, i) => {
      if (!head) return;
      const scale = 1 + Math.sin(time * 1.6 + i * 0.9) * 0.07;
      head.scale.setScalar(scale);
    });
  });

  return (
    <>
      {cities.map((city, i) => {
        const base = pointAt(city.slug);
        const label = labels.get(city.slug);
        if (!base || !label) return null;

        const named = labelled.has(city.slug);

        return (
          <group key={city.slug} position={base}>
            {/* Каплевидная булавка: конус остриём вниз плюс шар сверху дают
                знакомый силуэт отметки на карте. */}
            <group
              ref={(node) => {
                if (node) heads.current[i] = node;
              }}
              onClick={() => onSelect(city.slug)}
            >
              <mesh position={[0, named ? 0.2 : 0.12, 0]} castShadow>
                <coneGeometry args={[named ? 0.1 : 0.06, named ? 0.4 : 0.24, 18]} />
                <meshStandardMaterial
                  color={PALETTE.gold}
                  roughness={0.3}
                  metalness={0.55}
                />
              </mesh>
              <mesh position={[0, named ? 0.45 : 0.27, 0]} castShadow>
                <sphereGeometry args={[named ? 0.115 : 0.07, 20, 20]} />
                <meshStandardMaterial
                  color={PALETTE.gold}
                  emissive={PALETTE.gold}
                  emissiveIntensity={0.22}
                  roughness={0.28}
                  metalness={0.55}
                />
              </mesh>
            </group>

            {named && (
              <>
                {/* Выноска: подпись отведена вверх тонкой линией и не
                    закрывает то, что называет. */}
                <mesh position={[0, 0.85, 0]}>
                  <cylinderGeometry args={[0.006, 0.006, 0.7, 4]} />
                  <meshBasicMaterial
                    color={PALETTE.goldDeep}
                    transparent
                    opacity={0.55}
                  />
                </mesh>

                <sprite position={[0, 1.3, 0]} scale={[0.34 * label.aspect, 0.34, 1]}>
                  <spriteMaterial map={label.map} transparent depthWrite={false} />
                </sprite>
              </>
            )}
          </group>
        );
      })}
    </>
  );
}

/**
 * Мерв и Кашгар: концы пути за пределами страны. Без них Узбекистан
 * выглядит началом и концом дороги, а он был её серединой.
 */
function Gateways({
  pointAt,
  lang,
}: {
  pointAt: (slug: string) => THREE.Vector3 | null;
  lang: Lang;
}) {
  const labels = useMemo(
    () =>
      new Map(
        Object.entries(GATEWAYS).map(([slug, gate]) => [
          slug,
          labelTexture(gate.name[lang] ?? gate.name.en!, "gate"),
        ]),
      ),
    [lang],
  );

  useEffect(() => () => labels.forEach((l) => l.map.dispose()), [labels]);

  return (
    <>
      {Object.keys(GATEWAYS).map((slug) => {
        const base = pointAt(slug);
        const label = labels.get(slug);
        if (!base || !label) return null;

        return (
          <group key={slug} position={base}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[0.07, 0.11, 20]} />
              <meshBasicMaterial color={PALETTE.goldDeep} transparent opacity={0.75} />
            </mesh>
            <sprite position={[0, 0.34, 0]} scale={[0.28 * label.aspect, 0.28, 1]}>
              <spriteMaterial map={label.map} transparent depthWrite={false} />
            </sprite>
          </group>
        );
      })}
    </>
  );
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

/** Сдвиг курсора, после которого жест считается вращением, а не выбором. */
const DRAG_SLOP = 6;

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
   * Вращение камеры и выбор региона живут на одном жесте. Без порога любое
   * вращение заканчивалось бы переходом в город, поэтому меряем сдвиг:
   * потянули — вращаем, ткнули на месте — открываем.
   */
  const origin = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  const guardedSelect = useMemo(
    () => (city: string) => {
      if (!dragged.current) onSelect(city);
    },
    [onSelect],
  );

  /**
   * Вес региона — объекты самого города плюс те, что отнесены к нему
   * отдельными списками: Шахрисабз считается вместе с Кашкадарьёй, иначе
   * область выглядит пустой при живом городе внутри.
   */
  const weights = useMemo(() => {
    const out: Record<string, number> = {};
    for (const region of REGIONS) {
      out[region.city] =
        (counts[region.city] ?? 0) +
        region.extra.reduce((sum, slug) => sum + (counts[slug] ?? 0), 0);
    }
    return out;
  }, [counts]);

  const maxWeight = Math.max(1, ...Object.values(weights));

  const heights = useMemo(() => {
    const out: Record<string, number> = {};
    for (const region of REGIONS) {
      out[region.city] = MIN_HEIGHT + (weights[region.city] / maxWeight) * MAX_RISE;
    }
    return out;
  }, [weights, maxWeight]);

  const heightAt = useMemo(() => {
    return (lon: number, lat: number) => {
      const region = REGIONS.find((r) => inRing(lon, lat, r.ring));
      return region ? heights[region.city] : 0;
    };
  }, [heights]);

  /** Точка на карте по имени: города базы и внешние ворота пути. */
  const pointAt = useMemo(() => {
    const bySlug = new Map(cities.map((c) => [c.slug, c]));
    return (slug: string) => {
      const city = bySlug.get(slug);
      if (city) return world(city.lon, city.lat, heightAt(city.lon, city.lat));

      const gate = GATEWAYS[slug];
      if (gate) return world(gate.lon, gate.lat, 0);

      return null;
    };
  }, [cities, heightAt]);

  const hoveredRegion = hovered ? REGIONS.find((r) => r.city === hovered) : null;
  const hoveredCity = hovered ? cities.find((c) => c.slug === hovered) : null;

  return (
    <div
      className={`relative ${className}`}
      onPointerDownCapture={(e) => {
        origin.current = { x: e.clientX, y: e.clientY };
        dragged.current = false;
      }}
      onPointerMoveCapture={(e) => {
        if (!origin.current || dragged.current) return;
        const dx = e.clientX - origin.current.x;
        const dy = e.clientY - origin.current.y;
        if (Math.hypot(dx, dy) > DRAG_SLOP) dragged.current = true;
      }}
    >
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 9.5, 19], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <hemisphereLight args={["#fff6e6", "#bcc7c4", 0.65]} />
        <directionalLight
          position={[8, 14, 6]}
          intensity={1.75}
          color="#fff4de"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-16}
          shadow-camera-right={16}
          shadow-camera-top={16}
          shadow-camera-bottom={-16}
          shadow-bias={-0.0006}
        />
        <directionalLight position={[-10, 7, -8]} intensity={0.4} color="#9fd6bb" />

        <MapBoard lang={lang} />

        {REGIONS.map((region) => (
          <RegionMesh
            key={region.city}
            region={region}
            height={heights[region.city]}
            ratio={weights[region.city] / maxWeight}
            active={hovered === region.city}
            onHover={setHovered}
            onSelect={guardedSelect}
          />
        ))}

        <UzRivers heightAt={heightAt} />
        <UzLakes heightAt={heightAt} />
        <SilkRoad pointAt={pointAt} />
        <Gateways pointAt={pointAt} lang={lang} />
        <CityMarkers
          cities={cities}
          counts={counts}
          pointAt={pointAt}
          lang={lang}
          onSelect={guardedSelect}
        />

        <Controls />
        <FitToParent />
      </Canvas>

      {/* Легенда: без неё шкала и золотая линия просто красивые. */}
      <div
        className="pointer-events-none absolute left-3 top-3 rounded-[var(--radius-sm)] px-3 py-2 text-[11px]"
        style={{
          background: "color-mix(in srgb, var(--surface) 80%, transparent)",
          backdropFilter: "blur(10px)",
          border: "1px solid var(--border)",
          color: "var(--text-soft)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="flex items-center gap-2">
          <span>{t(lang, "map_less")}</span>
          <span
            className="h-2 w-16 rounded-full"
            style={{ background: RAMP_CSS }}
          />
          <span>{t(lang, "map_more")}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="h-0.5 w-8 rounded-full"
            style={{ background: PALETTE.gold }}
          />
          <span>{t(lang, "map_silk_road")}</span>
        </div>
      </div>

      {/* Подсказка про управление: без неё никто не догадается тянуть карту. */}
      <div
        className="pointer-events-none absolute right-3 top-3 rounded-full px-3 py-1.5 text-[11px]"
        style={{
          background: "color-mix(in srgb, var(--surface) 80%, transparent)",
          backdropFilter: "blur(10px)",
          border: "1px solid var(--border)",
          color: "var(--text-soft)",
        }}
      >
        {t(lang, "map_drag")}
      </div>

      {hoveredRegion && (
        <div
          className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-[var(--radius-md)] px-4 py-3"
          style={{
            background: "color-mix(in srgb, var(--surface) 78%, transparent)",
            backdropFilter: "blur(14px)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-2)",
          }}
        >
          <p className="font-semibold">{hoveredCity?.name ?? hoveredRegion.nameRu}</p>
          <p className="text-sm soft">
            {objectsCount(lang, weights[hoveredRegion.city])} · {t(lang, "map_open")}
          </p>
        </div>
      )}
    </div>
  );
}
