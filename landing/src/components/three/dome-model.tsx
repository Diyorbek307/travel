"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { текстураКирпича, текстураКупола, текстураМинарета, текстураПояса } from "./textures";

/**
 * Купол Гур-Эмира — процедурная модель, без файлов.
 *
 * Ребристый «дынный» купол строим сами: профиль по сплайну (барабан →
 * выпуклость → острый верх), а радиус чуть «волнится» по кругу — так
 * получаются рёбра, которые ловят свет. Ниже — барабан с поясом «вязи»,
 * восьмигранное основание и два минарета.
 */

const РЁБЕР = 64;

function геометрияКупола(радиус = 1.6, высота = 2.3) {
  // Профиль купола: (радиус, высота) в долях.
  const профиль = new THREE.SplineCurve(
    [
      [1.0, 0],
      [1.1, 0.1],
      [1.17, 0.26],
      [1.15, 0.44],
      [1.03, 0.62],
      [0.8, 0.78],
      [0.5, 0.9],
      [0.22, 0.97],
      [0.0, 1.0],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
  );
  const сегU = РЁБЕР * 6;
  const сегV = 64;
  const позиции: number[] = [];
  const uv: number[] = [];
  const индексы: number[] = [];
  for (let j = 0; j <= сегV; j++) {
    const v = j / сегV;
    const т = профиль.getPoint(v);
    for (let i = 0; i <= сегU; i++) {
      const u = i / сегU;
      const угол = u * Math.PI * 2;
      // Ребро — «гребень» синуса; к верху рёбра сходят на нет.
      const ребро = 1 + 0.045 * Math.pow(Math.abs(Math.cos((угол * РЁБЕР) / 2)), 0.6) * (1 - v * 0.7);
      const r = т.x * радиус * ребро;
      позиции.push(Math.cos(угол) * r, т.y * высота, Math.sin(угол) * r);
      uv.push(u, v);
    }
  }
  for (let j = 0; j < сегV; j++) {
    for (let i = 0; i < сегU; i++) {
      const a = j * (сегU + 1) + i;
      const b = a + сегU + 1;
      индексы.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const г = new THREE.BufferGeometry();
  г.setAttribute("position", new THREE.Float32BufferAttribute(позиции, 3));
  г.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  г.setIndex(индексы);
  г.computeVertexNormals();
  return г;
}

/** Стрельчатая арка — силуэт ниши (пештака) в основании. */
function геометрияАрки(ш = 0.62, в = 0.95) {
  const ф = new THREE.Shape();
  ф.moveTo(-ш / 2, 0);
  ф.lineTo(-ш / 2, в * 0.6);
  ф.quadraticCurveTo(-ш / 2, в * 0.92, 0, в);
  ф.quadraticCurveTo(ш / 2, в * 0.92, ш / 2, в * 0.6);
  ф.lineTo(ш / 2, 0);
  ф.closePath();
  return new THREE.ShapeGeometry(ф, 16);
}

function Минарет({ x, z }: { x: number; z: number }) {
  const текстура = useMemo(() => текстураМинарета(), []);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 4.4, 24]} />
        <meshStandardMaterial map={текстура} roughness={0.8} />
      </mesh>
      {/* Балкон-фонарь */}
      <mesh position={[0, 4.45, 0]}>
        <cylinderGeometry args={[0.32, 0.24, 0.3, 24]} />
        <meshStandardMaterial color="#1fb3a8" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 4.75, 0]}>
        <sphereGeometry args={[0.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#27c2b6" roughness={0.35} />
      </mesh>
      <mesh position={[0, 5.02, 0]}>
        <coneGeometry args={[0.04, 0.3, 12]} />
        <meshStandardMaterial color="#e2b94a" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}

export default function МодельКупола() {
  const купол = useMemo(() => геометрияКупола(), []);
  const глазурь = useMemo(() => текстураКупола(), []);
  const пояс = useMemo(() => текстураПояса(), []);
  const кирпич = useMemo(() => текстураКирпича(), []);
  const арка = useMemo(() => геометрияАрки(), []);
  const рамка = useMemo(() => геометрияАрки(0.8, 1.12), []);

  return (
    <group position={[0, -2.6, 0]}>
      {/* Восьмигранное основание */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.4, 2.5, 1.4, 8]} />
        <meshStandardMaterial map={кирпич} roughness={0.9} />
      </mesh>
      {/* Ниши-арки по граням основания */}
      {Array.from({ length: 8 }, (_, i) => {
        const угол = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return (
          <group
            key={i}
            position={[Math.cos(угол) * 2.33, 0.12, Math.sin(угол) * 2.33]}
            rotation={[0, -угол + Math.PI / 2, 0]}
          >
            {/* Изразцовая рамка и тёмная глубина ниши */}
            <mesh geometry={рамка}>
              <meshStandardMaterial color="#2aa9cf" roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
            <mesh geometry={арка} position={[0, 0.06, 0.01]}>
              <meshStandardMaterial color="#16305f" roughness={0.7} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
      {/* Барабан с поясом «вязи» */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <cylinderGeometry args={[1.62, 1.72, 1.1, 64, 1, true]} />
        <meshStandardMaterial map={пояс} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* Купол */}
      <mesh geometry={купол} position={[0, 2.5, 0]} castShadow>
        <meshStandardMaterial map={глазурь} roughness={0.28} metalness={0.15} envMapIntensity={1.2} />
      </mesh>
      {/* Навершие */}
      <group position={[0, 4.8, 0]}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.05, 0.9, 12]} />
          <meshStandardMaterial color="#e2b94a" metalness={0.95} roughness={0.2} />
        </mesh>
        {[0.15, 0.32].map((y, i) => (
          <mesh key={y} position={[0, y, 0]}>
            <sphereGeometry args={[0.1 - i * 0.03, 20, 20]} />
            <meshStandardMaterial color="#f0c95a" metalness={0.95} roughness={0.18} />
          </mesh>
        ))}
        <mesh position={[0, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.09, 0.02, 10, 24, Math.PI * 1.4]} />
          <meshStandardMaterial color="#f0c95a" metalness={0.95} roughness={0.18} />
        </mesh>
      </group>
      <Минарет x={-3.1} z={0.6} />
      <Минарет x={3.1} z={0.6} />
    </group>
  );
}
