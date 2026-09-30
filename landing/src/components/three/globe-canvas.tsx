"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/**
 * Глобус «10 языков — 10 направлений»: из городов, где говорят на языках
 * HelloUZ, к Ташкенту тянутся светящиеся дуги, по ним бегут огоньки.
 * Материков нет намеренно — только сетка меридианов: «карта связей», а
 * не атлас. Крутится сам, можно повернуть мышью или пальцем.
 */

const R = 2;

function точка(шир: number, долг: number, r = R) {
  const φ = ((90 - шир) * Math.PI) / 180;
  const θ = ((долг + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(φ) * Math.cos(θ), r * Math.cos(φ), r * Math.sin(φ) * Math.sin(θ));
}

const ТАШКЕНТ = { шир: 41.3, долг: 69.24 };

/** Сдвиг подписи в пикселях — соседние города Европы и Азии не слипаются. */
const ГОРОДА = [
  { имя: "London", привет: "Hello", шир: 51.5, долг: -0.12, dx: -14, dy: -14 },
  { имя: "Москва", привет: "Привет", шир: 55.75, долг: 37.62, dx: 10, dy: -26 },
  { имя: "北京", привет: "你好", шир: 39.9, долг: 116.4, dx: 0, dy: -24 },
  { имя: "서울", привет: "안녕하세요", шир: 37.57, долг: 126.98, dx: 30, dy: 12 },
  { имя: "Berlin", привет: "Hallo", шир: 52.52, долг: 13.4, dx: 8, dy: -28 },
  { имя: "Paris", привет: "Bonjour", шир: 48.86, долг: 2.35, dx: 6, dy: 20 },
  { имя: "東京", привет: "こんにちは", шир: 35.68, долг: 139.69, dx: 36, dy: -16 },
  { имя: "İstanbul", привет: "Merhaba", шир: 41.01, долг: 28.98, dx: -10, dy: 26 },
  { имя: "الرياض", привет: "مرحبا", шир: 24.71, долг: 46.68, dx: 0, dy: 22 },
];

/** Сетка меридианов и параллелей. */
function Сетка() {
  const геом = useMemo(() => {
    const т: number[] = [];
    for (let шир = -75; шир <= 75; шир += 15) {
      for (let д = -180; д < 180; д += 4) {
        const a = точка(шир, д, R * 1.001);
        const b = точка(шир, д + 4, R * 1.001);
        т.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    for (let д = -180; д < 180; д += 15) {
      for (let шир = -88; шир < 88; шир += 4) {
        const a = точка(шир, д, R * 1.001);
        const b = точка(шир + 4, д, R * 1.001);
        т.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(т, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={геом}>
      <lineBasicMaterial color="#2fd0c6" transparent opacity={0.18} />
    </lineSegments>
  );
}

/** Свечение атмосферы — френель на обратной стороне сферы. */
function Атмосфера() {
  const материал = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#2fd0c6") } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uColor; varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(uColor, 1.0) * i; }`,
      }),
    [],
  );
  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[R, 64, 64]} />
      <primitive object={материал} attach="material" />
    </mesh>
  );
}

function Дуга({ от, смещение }: { от: THREE.Vector3; смещение: number }) {
  const до = useMemo(() => точка(ТАШКЕНТ.шир, ТАШКЕНТ.долг), []);
  const кривая = useMemo(() => {
    const середина = от.clone().add(до).multiplyScalar(0.5);
    const высота = 1 + от.distanceTo(до) * 0.28;
    середина.normalize().multiplyScalar(R * высота);
    return new THREE.QuadraticBezierCurve3(от, середина, до);
  }, [от, до]);
  const труба = useMemo(() => new THREE.TubeGeometry(кривая, 64, 0.008, 8, false), [кривая]);
  const огонёк = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const т = (clock.elapsedTime * 0.22 + смещение) % 1;
    огонёк.current?.position.copy(кривая.getPoint(т));
  });
  return (
    <group>
      <mesh geometry={труба}>
        <meshBasicMaterial color="#e9c46a" transparent opacity={0.55} />
      </mesh>
      <mesh ref={огонёк}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#fff3c4" />
      </mesh>
    </group>
  );
}

function Глобус({ подписи }: { подписи: boolean }) {
  const шар = useRef<THREE.Mesh>(null);
  const группа = useRef<THREE.Group>(null);
  // Разворачиваем глобус Узбекистаном к зрителю.
  const поворот = useMemo(() => {
    const v = точка(ТАШКЕНТ.шир, ТАШКЕНТ.долг);
    return Math.atan2(-v.x, v.z);
  }, []);
  const ташкент = useMemo(() => точка(ТАШКЕНТ.шир, ТАШКЕНТ.долг), []);
  const пульс = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const s = 1 + ((clock.elapsedTime * 0.8) % 1) * 2.2;
    if (пульс.current) {
      пульс.current.scale.setScalar(s);
      (пульс.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - (s - 1) / 2.2);
    }
  });
  return (
    <group ref={группа} rotation={[0.62, поворот, 0]}>
      <mesh ref={шар}>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial color="#0d3b37" roughness={0.7} metalness={0.1} />
      </mesh>
      <Сетка />
      <Атмосфера />
      {/* Ташкент — пульсирующая точка */}
      <group
        position={ташкент}
        quaternion={new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          ташкент.clone().normalize(),
        )}
      >
        <mesh>
          <circleGeometry args={[0.05, 32]} />
          <meshBasicMaterial color="#e9c46a" />
        </mesh>
        <mesh ref={пульс}>
          <ringGeometry args={[0.05, 0.065, 32]} />
          <meshBasicMaterial color="#e9c46a" transparent />
        </mesh>
      </group>
      {ГОРОДА.map((г, n) => {
        const p = точка(г.шир, г.долг);
        return (
          <group key={г.имя}>
            <mesh position={p}>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshBasicMaterial color="#2fd0c6" />
            </mesh>
            <Дуга от={p} смещение={n / ГОРОДА.length} />
            {подписи && (
              <Html
                position={p.clone().multiplyScalar(1.06)}
                center
                occlude={[шар as React.RefObject<THREE.Object3D>]}
                zIndexRange={[20, 0]}
              >
                <div
                  className="pointer-events-none whitespace-nowrap rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
                  style={{ transform: `translate(${г.dx}px, ${г.dy}px)` }}
                >
                  {г.привет}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default function СценаГлобуса() {
  const коробка = useRef<HTMLDivElement>(null);
  const [виден, setВиден] = useState(true);
  const [широкий, setШирокий] = useState(true);
  useEffect(() => {
    setШирокий(window.innerWidth > 640);
    const наб = new IntersectionObserver(([e]) => setВиден(e.isIntersecting));
    if (коробка.current) наб.observe(коробка.current);
    return () => наб.disconnect();
  }, []);
  return (
    <div ref={коробка} className="h-full w-full cursor-grab active:cursor-grabbing">
      <Canvas
        frameloop={виден ? "always" : "never"}
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={1.6} color="#ffe2b8" />
        <Глобус подписи={широкий} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
