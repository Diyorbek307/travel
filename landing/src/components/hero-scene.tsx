"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Dome from "./dome";

/**
 * Сцена первого экрана.
 *
 * Никаких внешних ресурсов: ни HDRI, ни моделей, ни текстур с CDN.
 * Всё освещение выставлено вручную. Это нужно не из аскетизма — внешний
 * HDRI весит мегабайты, требует сети и ломается под строгим CSP.
 */

/** Пыль в воздухе: даёт глубину и ощущение объёма вокруг объекта. */
function Dust({ count = 900 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Точки в сферической оболочке, а не в кубе: у куба видны углы.
      const radius = 4 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * 0.55;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y -= delta * 0.02;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.035}
        color="#71dcd9"
        transparent
        opacity={0.55}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Лёгкий параллакс камеры за курсором. Сдвиг маленький — иначе укачивает. */
function CameraParallax() {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.3, 0));

  useFrame(() => {
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (1.1 + pointer.y * 0.35 - camera.position.y) * 0.03;
    camera.lookAt(target.current);
  });

  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      // dpr ограничен сверху двойкой: на телефонах с dpr 3-4 сцена
      // рендерится вчетверо дороже без видимой разницы.
      dpr={[1, 2]}
      camera={{ position: [0, 1.1, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <fog attach="fog" args={["#04080b", 6, 16]} />

      {/* Заполняющий свет — очень слабый, чтобы тени остались глубокими */}
      <ambientLight intensity={0.35} />

      {/* Ключевой: тёплый, как закатное солнце над Самаркандом */}
      <directionalLight position={[4, 6, 3]} intensity={2.4} color="#ffd9a8" />

      {/* Контровой бирюзовый — обводит силуэт купола и отделяет от фона */}
      <pointLight position={[-5, 2, -4]} intensity={38} color="#35c2c2" distance={20} />

      {/* Нижняя подсветка золотом — рефлекс от «земли» */}
      <pointLight position={[0, -2.5, 2]} intensity={14} color="#cd9a60" distance={12} />

      <Suspense fallback={null}>
        <Dome />
        <Dust />
      </Suspense>

      <CameraParallax />
    </Canvas>
  );
}
