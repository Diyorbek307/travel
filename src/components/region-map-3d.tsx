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
  RELIEF,
  RELIEF_BOX,
  RELIEF_LIFT,
  RELIEF_SIZE,
  inRing,
  labelTexture,
  project,
  world,
} from "@/lib/map-atlas";
import { SHORT_NAME } from "@/lib/city-names";
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
 * Толщина плиты — одна на все области.
 *
 * Раньше высота несла число объектов. Теперь поверх плит лежит настоящий
 * рельеф сплошной поверхностью, и разные высоты порвали бы её на ступени.
 * Данные о наполнении переехали на булавки городов, а высота стала тем,
 * чем и должна быть на карте, — географией.
 */
const PLATE_HEIGHT = 0.3;

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
    controls.minPolarAngle = 0.2;
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

/**
 * Плита области.
 *
 * Даёт силуэту толщину и тёмный торец с тёплым низом — то, что в макете
 * читается как предмет на столе. Верх плиты почти не виден: поверх лежит
 * рельеф. Взаимодействия у плиты нет, и это осознанно — рельеф перекрыл бы
 * её собой, а нажимать по невидимому нельзя. Городами управляют булавки.
 */
function RegionMesh({ region }: { region: (typeof REGIONS)[number] }) {
  const solid = useMemo(() => {
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

    const shape = new THREE.Shape();
    flat.forEach(([x, y], i) => {
      const px = cx + (x - cx) * GAP;
      const py = cy + (y - cy) * GAP;
      if (i === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    });
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: PLATE_HEIGHT,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 1,
    });
    geometry.rotateX(-Math.PI / 2);
    geometry.computeVertexNormals();
    return geometry;
  }, [region]);

  const materials = useMemo(() => {
    // ExtrudeGeometry сама делит поверхность на две группы: крышки и стенки.
    const cap = new THREE.MeshStandardMaterial({
      color: PALETTE.cap,
      roughness: 0.7,
      metalness: 0.04,
    });
    const wall = new THREE.MeshStandardMaterial({
      map: wallTexture(),
      roughness: 0.8,
      metalness: 0.04,
    });
    return [cap, wall];
  }, []);

  useEffect(() => {
    return () => {
      solid.dispose();
      materials.forEach((m) => m.dispose());
    };
  }, [solid, materials]);

  return <mesh geometry={solid} material={materials} castShadow receiveShadow />;
}

/* ─────────────────────────── Рельеф ─────────────────────────── */

/**
 * Настоящий рельеф страны поверх плит.
 *
 * Высоты и раскраска — SRTM, собранные в два растра скриптом сборки.
 * Плоскость смещается картой высот, цвет берётся из гипсометрической
 * раскраски с отмывкой; за границей страны раскраска прозрачна, поэтому
 * рельеф обрывается ровно по контуру и лишнего не показывает.
 *
 * Сетка в 320 на 208 делений — примерно треть разрешения растра. Больше
 * не нужно: на экране телефона страна занимает около тысячи точек, а
 * каждое деление это два треугольника.
 */
function Relief({ base }: { base: number }) {
  const [maps, setMaps] = useState<{
    height: THREE.Texture;
    color: THREE.Texture;
  } | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let alive = true;

    Promise.all([
      loader.loadAsync(RELIEF.height),
      loader.loadAsync(RELIEF.color),
    ])
      .then(([height, color]) => {
        if (!alive) {
          height.dispose();
          color.dispose();
          return;
        }
        color.colorSpace = THREE.SRGBColorSpace;
        color.anisotropy = 8;
        setMaps({ height, color });
      })
      // Рельеф — украшение поверх работающей карты: не загрузился,
      // значит остаются плиты, и экран не ломается.
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  useEffect(
    () => () => {
      maps?.height.dispose();
      maps?.color.dispose();
    },
    [maps],
  );

  if (!maps) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, base, 0]} receiveShadow castShadow>
      <planeGeometry args={[RELIEF_SIZE.width, RELIEF_SIZE.depth, 320, 208]} />
      <meshStandardMaterial
        map={maps.color}
        displacementMap={maps.height}
        displacementScale={RELIEF_LIFT}
        transparent
        // Прозрачные точки за границей не должны писать глубину, иначе они
        // закрывают собой то, что лежит ниже, — торцы плит и подложку.
        alphaTest={0.5}
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  );
}

/**
 * Высота рельефа в точке.
 *
 * Читается из той же карты высот, что смещает вершины, — иначе булавка
 * встанет не на ту отметку, на которую поднялась под ней земля. Растр
 * рисуется в скрытый холст один раз, дальше это просто выборка из массива.
 *
 * Пока карта не загружена, возвращается null: сцена рисует булавки на
 * плоскости и переставит их, когда рельеф приедет.
 */
function useElevation(): ((lon: number, lat: number) => number) | null {
  const [sample, setSample] = useState<
    ((lon: number, lat: number) => number) | null
  >(null);

  useEffect(() => {
    let alive = true;
    const image = new window.Image();

    image.onload = () => {
      if (!alive) return;
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(image, 0, 0);
      const { data } = ctx.getImageData(0, 0, image.width, image.height);
      const { width, height } = image;

      setSample(() => (lon: number, lat: number) => {
        const u = (lon - RELIEF_BOX.minLon) / (RELIEF_BOX.maxLon - RELIEF_BOX.minLon);
        const v = (RELIEF_BOX.maxLat - lat) / (RELIEF_BOX.maxLat - RELIEF_BOX.minLat);
        if (u < 0 || u > 1 || v < 0 || v > 1) return 0;

        const x = Math.min(width - 1, Math.max(0, Math.round(u * width)));
        const y = Math.min(height - 1, Math.max(0, Math.round(v * height)));
        return (data[(y * width + x) * 4] / 255) * RELIEF_LIFT;
      });
    };

    image.src = RELIEF.height;
    return () => {
      alive = false;
    };
  }, []);

  return sample;
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
  onHover,
  onSelect,
}: {
  cities: City[];
  counts: Record<string, number>;
  pointAt: (slug: string) => THREE.Vector3 | null;
  lang: Lang;
  onHover: (city: string | null) => void;
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
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                onHover(city.slug);
              }}
              onPointerOut={() => onHover(null)}
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
                <mesh position={[0, 0.72, 0]}>
                  <cylinderGeometry args={[0.006, 0.006, 0.45, 4]} />
                  <meshBasicMaterial
                    color={PALETTE.goldDeep}
                    transparent
                    opacity={0.55}
                  />
                </mesh>

                <sprite position={[0, 1.02, 0]} scale={[0.34 * label.aspect, 0.34, 1]}>
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

  const elevation = useElevation();

  /**
   * Отметка, на которой стоит объект: верх плиты плюс подъём рельефа.
   * Пока карта высот не приехала, всё стоит на плоскости и переставится
   * само, когда она загрузится.
   */
  const heightAt = useMemo(() => {
    return (lon: number, lat: number) => {
      if (!inRing(lon, lat, REGIONS[0].ring) && !REGIONS.some((r) => inRing(lon, lat, r.ring))) {
        return 0;
      }
      return PLATE_HEIGHT + (elevation?.(lon, lat) ?? 0);
    };
  }, [elevation]);

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
        camera={{ position: [0, 12.5, 16], fov: 34 }}
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
          <RegionMesh key={region.city} region={region} />
        ))}

        {/* Рельеф ложится поверх плит сплошной поверхностью. Реки, озёра
            и границы областей нарисованы прямо в его раскраске: трубками
            поверх настоящих склонов они бы висели в воздухе. */}
        <Relief base={PLATE_HEIGHT} />
        <SilkRoad pointAt={pointAt} />
        <Gateways pointAt={pointAt} lang={lang} />
        <CityMarkers
          cities={cities}
          counts={counts}
          pointAt={pointAt}
          lang={lang}
          onHover={setHovered}
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
          <span>{t(lang, "map_lowland")}</span>
          <span
            className="h-2 w-16 rounded-full"
            // Те же ступени, что и в гипсометрической шкале рельефа
            // (см. scripts/geo/build-relief.py): пески, предгорья, горы, снег.
            style={{
              background:
                "linear-gradient(90deg,#d6cdb0,#bfa876,#aa8d62,#927658,#968d85,#e2e2e2)",
            }}
          />
          <span>{t(lang, "map_mountains")}</span>
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

      {hoveredCity && (
        <div
          className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-[var(--radius-md)] px-4 py-3"
          style={{
            background: "color-mix(in srgb, var(--surface) 78%, transparent)",
            backdropFilter: "blur(14px)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-2)",
          }}
        >
          <p className="font-semibold">{hoveredCity.name}</p>
          <p className="text-sm soft">
            {objectsCount(lang, counts[hoveredCity.slug] ?? 0)} · {t(lang, "map_open")}
          </p>
        </div>
      )}
    </div>
  );
}
