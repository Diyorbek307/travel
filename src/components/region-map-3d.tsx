"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import regions from "@/data/uzbekistan-regions.json";

/**
 * Трёхмерная карта Узбекистана.
 *
 * Регионы выдавлены призмами, высота пропорциональна числу объектов в базе —
 * то есть рельеф здесь не декоративный, а показывает, где контента больше.
 *
 * Границы взяты из Natural Earth (public domain) и упрощены алгоритмом
 * Дугласа–Пекера до 679 точек на всю страну: 13 КБ вместо мегабайтов.
 * Это важно — файл попадает в офлайн-пакет города.
 *
 * Сцена грузится только на этом экране: Next выносит three.js в отдельный
 * чанк, поэтому вес не ложится на остальное приложение.
 */

interface Region {
  city: string;
  extra: string[];
  nameRu: string;
  ring: [number, number][];
}

const DATA = regions as Region[];

/** Границы страны — нужны, чтобы вписать карту в кадр. */
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

const SCALE = 14 / (BOUNDS.maxLon - BOUNDS.minLon);

/** Градусы → координаты сцены. Центрируем страну в начале координат. */
function project(lon: number, lat: number): [number, number] {
  return [
    (lon - (BOUNDS.minLon + BOUNDS.maxLon) / 2) * SCALE,
    (lat - (BOUNDS.minLat + BOUNDS.maxLat) / 2) * SCALE,
  ];
}

function RegionMesh({
  region,
  height,
  active,
  onHover,
  onSelect,
}: {
  region: Region;
  height: number;
  active: boolean;
  onHover: (city: string | null) => void;
  onSelect: (city: string) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    region.ring.forEach(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      bevelSegments: 1,
    });
    // Shape лежит в плоскости XY, а карту смотрим сверху — кладём в XZ.
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, [region, height]);

  // Активный регион приподнимается — это заметнее, чем смена цвета,
  // и работает даже при дальтонизме.
  useFrame((_, delta) => {
    if (!mesh.current) return;
    const target = active ? 0.35 : 0;
    mesh.current.position.y += (target - mesh.current.position.y) * Math.min(1, delta * 8);
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
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
        color={active ? "#e9c46a" : "#2e7d5a"}
        metalness={0.15}
        roughness={active ? 0.35 : 0.6}
        emissive={active ? "#e9c46a" : "#000000"}
        emissiveIntensity={active ? 0.18 : 0}
      />
    </mesh>
  );
}

/**
 * Медленное вращение камеры вокруг страны плюс отклик на курсор.
 * Останавливается, когда пользователь навёл на регион, — иначе прицелиться
 * в движущуюся мишень невозможно.
 */
function CameraRig({ paused }: { paused: boolean }) {
  const { camera, pointer } = useThree();
  const angle = useRef(0);
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame((_, delta) => {
    if (!paused) angle.current += delta * 0.08;
    const radius = 15;
    const wanted = new THREE.Vector3(
      Math.sin(angle.current) * radius + pointer.x * 1.5,
      10 + pointer.y * 1.5,
      Math.cos(angle.current) * radius,
    );
    camera.position.lerp(wanted, 0.05);
    camera.lookAt(target);
  });

  return null;
}

/** Подгонка холста под контейнер — R3F измеряет его сам, но не всегда вовремя. */
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

export default function RegionMap3D({
  counts,
  onSelect,
  className = "",
}: {
  /** Сколько объектов в каждом городе — определяет высоту призмы. */
  counts: Record<string, number>;
  onSelect: (city: string) => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <div className={`relative ${className}`}>
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 10, 15], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[6, 12, 6]}
          intensity={1.9}
          color="#fff6e6"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-8, 5, -6]} intensity={0.5} color="#66b38e" />

        {DATA.map((region) => {
          const count = counts[region.city] ?? 0;
          // Минимальная высота, чтобы регион без объектов не был плоским пятном.
          const height = 0.25 + (count / maxCount) * 1.4;
          return (
            <RegionMesh
              key={region.city}
              region={region}
              height={height}
              active={hovered === region.city}
              onHover={setHovered}
              onSelect={onSelect}
            />
          );
        })}

        <CameraRig paused={hovered !== null} />
        <FitToParent />
      </Canvas>

      {/* Стеклянная подпись поверх сцены — тот самый приём из референса,
          но здесь он работает: под ней объёмная сцена, а не плоский фон. */}
      {hovered && (
        <div
          className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-[var(--radius-md)] px-4 py-3"
          style={{
            background: "color-mix(in srgb, var(--surface) 72%, transparent)",
            backdropFilter: "blur(14px)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-2)",
          }}
        >
          <p className="font-semibold">
            {DATA.find((r) => r.city === hovered)?.nameRu}
          </p>
          <p className="text-sm soft">
            {counts[hovered] ?? 0} объектов · нажмите, чтобы открыть
          </p>
        </div>
      )}
    </div>
  );
}
