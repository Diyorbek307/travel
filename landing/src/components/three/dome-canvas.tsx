"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, Sparkles } from "@react-three/drei";
import type { Group } from "three";
import МодельКупола from "./dome-model";

/**
 * Сцена с куполом. Поворот задаёт прокрутка (прогресс 0…1 приходит
 * снаружи) плюс лёгкий отклик на мышь. Освещение — закатное, окружение
 * собрано из «лайтформеров»: без загрузки HDR-файлов из сети.
 */

function Вращение({ прогресс, children }: { прогресс: React.RefObject<number>; children: React.ReactNode }) {
  const группа = useRef<Group>(null);
  const мышь = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const при = (e: PointerEvent) => {
      мышь.current = { x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 };
    };
    window.addEventListener("pointermove", при);
    return () => window.removeEventListener("pointermove", при);
  }, []);
  useFrame((_, dt) => {
    const г = группа.current;
    if (!г) return;
    const цель = -0.4 + (прогресс.current ?? 0) * Math.PI * 2 + мышь.current.x * 0.5;
    г.rotation.y += (цель - г.rotation.y) * Math.min(1, dt * 4);
    г.rotation.x += (мышь.current.y * 0.12 - г.rotation.x) * Math.min(1, dt * 3);
  });
  return <group ref={группа}>{children}</group>;
}

export default function СценаКупола({ прогресс }: { прогресс: React.RefObject<number> }) {
  const коробка = useRef<HTMLDivElement>(null);
  const [виден, setВиден] = useState(true);
  // Вне экрана не рисуем: батарея и вентилятор скажут спасибо.
  useEffect(() => {
    const наб = new IntersectionObserver(([e]) => setВиден(e.isIntersecting));
    if (коробка.current) наб.observe(коробка.current);
    return () => наб.disconnect();
  }, []);

  return (
    <div ref={коробка} className="h-full w-full">
      <Canvas
        frameloop={виден ? "always" : "never"}
        shadows
        dpr={[1, 1.8]}
        camera={{ position: [0, 1.4, 12.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[6, 8, 5]}
          intensity={2.4}
          color="#ffd7a1"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-6, 3, -4]} intensity={1.1} color="#5fe0d4" />
        <Environment resolution={128}>
          <Lightformer intensity={2} color="#ffcf9a" position={[0, 5, -9]} scale={[10, 3, 1]} />
          <Lightformer intensity={1.2} color="#7fe7dc" position={[-6, 1, 3]} scale={[4, 6, 1]} />
          <Lightformer intensity={0.8} color="#ffffff" position={[6, 2, 4]} scale={[3, 3, 1]} />
        </Environment>
        <Вращение прогресс={прогресс}>
          <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.35}>
            <МодельКупола />
          </Float>
        </Вращение>
        <Sparkles count={70} scale={[9, 6, 6]} size={3} speed={0.35} color="#f0c95a" opacity={0.8} />
        <ContactShadows
          position={[0, -2.62, 0]}
          opacity={0.35}
          scale={14}
          blur={2.6}
          far={4}
          color="#5b3a1e"
        />
      </Canvas>
    </div>
  );
}
