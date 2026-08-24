"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Ребристый купол — силуэт Гур-Эмира.
 *
 * Модель строится процедурно, а не загружается файлом. Причины две:
 * готовой модели мавзолея под свободной лицензией нет, а покупная весила бы
 * мегабайты. Здесь геометрия — несколько килобайт кода, и её форму можно
 * править параметрами.
 *
 * Как получаются рёбра: берём профиль купола, вращаем его вокруг оси
 * (LatheGeometry), а затем модулируем радиус каждой вершины по углу —
 * получаются те самые вертикальные доли, из-за которых купол выглядит
 * не шаром, а дыней. У настоящего Гур-Эмира таких долей 64.
 */

/** Профиль купола: [радиус, высота] снизу вверх. Лёгкая пузатость на 0.35. */
const PROFILE: [number, number][] = [
  [1.0, 0.0],
  [1.06, 0.16],
  [1.08, 0.34],
  [1.05, 0.52],
  [0.96, 0.7],
  [0.82, 0.88],
  [0.62, 1.06],
  [0.38, 1.2],
  [0.16, 1.3],
  [0.0, 1.35],
];

const RIBS = 32;
const RIB_DEPTH = 0.04;

function buildDomeGeometry(): THREE.BufferGeometry {
  const points = PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
  // 256 сегментов по окружности: меньше — рёбра выглядят гранёными.
  const geometry = new THREE.LatheGeometry(points, 256);

  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const radius = Math.hypot(x, z);
    if (radius < 1e-4) continue;

    const theta = Math.atan2(z, x);
    // Гладкие доли: косинус даёт скруглённые рёбра, а не пилу.
    const factor = 1 + RIB_DEPTH * (0.5 + 0.5 * Math.cos(RIBS * theta));
    position.setX(i, (x / radius) * radius * factor);
    position.setZ(i, (z / radius) * radius * factor);
  }
  position.needsUpdate = true;

  // После смещения вершин нормали устарели — без пересчёта свет ляжет плоско.
  geometry.computeVertexNormals();
  return geometry;
}

export default function Dome() {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(buildDomeGeometry, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    // Едва заметное покачивание — сцена перестаёт выглядеть мёртвой.
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
  });

  return (
    <group ref={group}>
      {/* Купол */}
      <mesh geometry={geometry} castShadow position={[0, 0.55, 0]}>
        <meshPhysicalMaterial
          color="#1aa5a8"
          metalness={0.35}
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.18}
          envMapIntensity={0.7}
        />
      </mesh>

      {/* Барабан под куполом */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 1.4, 128, 1, true]} />
        <meshStandardMaterial
          color="#0f5e63"
          metalness={0.2}
          roughness={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Золотой пояс с надписью — на реальных мавзолеях это куфический фриз */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[1.015, 1.015, 0.22, 128, 1, true]} />
        <meshStandardMaterial
          color="#cd9a60"
          metalness={0.85}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Основание */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[1.9, 0.22, 1.9]} />
        <meshStandardMaterial color="#0c3a3e" metalness={0.1} roughness={0.8} />
      </mesh>
    </group>
  );
}
