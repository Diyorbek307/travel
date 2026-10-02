"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Настоящая Земля: снимки NASA Blue Marble (день) и Black Marble (ночные
 * огни городов), карта нормалей для рельефа, маска океанов для блика
 * солнца и отдельный слой облаков. Свет — от Солнца: дневная сторона
 * освещена, на ночной горят города, по терминатору — мягкий переход.
 * Из городов, где говорят на языках HelloUZ, к Ташкенту идут дуги.
 *
 * Текстуры лежат в public/earth (NASA — общественное достояние).
 */

const R = 2;

function точка(шир: number, долг: number, r = R) {
  const φ = ((90 - шир) * Math.PI) / 180;
  const θ = ((долг + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(φ) * Math.cos(θ), r * Math.cos(φ), r * Math.sin(φ) * Math.sin(θ));
}

const ТАШКЕНТ = { шир: 41.3, долг: 69.24 };
/** Солнце над Аравией: Европа и Узбекистан днём, Восточная Азия — в огнях ночи. */
const СОЛНЦЕ = точка(12, 38, 1).normalize();
/** Наклон Земли к зрителю — северное полушарие виднее. */
const НАКЛОН = 0.55;

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

const вершинный = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vPos = position;
    vNormal = normalize(normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Нормали из карты без касательных — через производные экрана
// (тот же приём, что perturbNormal2Arb в three.js).
const фрагментный = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D specMap;
  uniform sampler2D normalMap;
  uniform vec3 sunDir;
  uniform vec3 camPos;
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vNormal;

  vec3 perturb(vec3 n) {
    vec3 q0 = dFdx(vPos);
    vec3 q1 = dFdy(vPos);
    vec2 st0 = dFdx(vUv);
    vec2 st1 = dFdy(vUv);
    vec3 q1perp = cross(q1, n);
    vec3 q0perp = cross(n, q0);
    vec3 T = q1perp * st0.x + q0perp * st1.x;
    vec3 B = q1perp * st0.y + q0perp * st1.y;
    float det = max(dot(T, T), dot(B, B));
    float scale = det == 0.0 ? 0.0 : inversesqrt(det);
    vec3 mapN = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    mapN.xy *= 0.9;
    return normalize(T * (mapN.x * scale) + B * (mapN.y * scale) + n * mapN.z);
  }

  void main() {
    vec3 n0 = normalize(vNormal);
    vec3 n = perturb(n0);
    vec3 view = normalize(camPos - vPos);
    float light = dot(n, sunDir);
    float dayMix = smoothstep(-0.18, 0.28, dot(n0, sunDir));

    vec3 day = texture2D(dayMap, vUv).rgb;
    vec3 night = texture2D(nightMap, vUv).rgb;
    // Ночные огни — тёплые и яркие, днём гаснут.
    vec3 lights = pow(night, vec3(1.35)) * vec3(1.6, 1.25, 0.8);

    vec3 color = mix(lights, day * (0.06 + 1.15 * max(light, 0.0)), dayMix);

    // Блик солнца — только на воде.
    float water = texture2D(specMap, vUv).r;
    vec3 h = normalize(sunDir + view);
    float spec = pow(max(dot(n0, h), 0.0), 60.0) * water * dayMix;
    color += vec3(1.0, 0.92, 0.78) * spec * 0.9;

    // Дымка атмосферы по краю диска.
    float fres = pow(1.0 - max(dot(n0, view), 0.0), 3.0);
    color = mix(color, vec3(0.35, 0.62, 1.0), fres * (0.25 + 0.55 * dayMix));

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Земля() {
  const [day, night, spec, normal] = useLoader(THREE.TextureLoader, [
    "/earth/day.webp",
    "/earth/night.webp",
    "/earth/specular.webp",
    "/earth/normal.webp",
  ]);
  const { gl } = useThree();
  const материал = useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    night.colorSpace = THREE.SRGBColorSpace;
    const a = Math.min(8, gl.capabilities.getMaxAnisotropy());
    [day, night, spec, normal].forEach((t) => (t.anisotropy = a));
    return new THREE.ShaderMaterial({
      uniforms: {
        dayMap: { value: day },
        nightMap: { value: night },
        specMap: { value: spec },
        normalMap: { value: normal },
        sunDir: { value: СОЛНЦЕ },
        camPos: { value: new THREE.Vector3() },
      },
      vertexShader: вершинный,
      fragmentShader: фрагментный,
    });
  }, [day, night, spec, normal, gl]);
  const шар = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    // Камера в координатах Земли — для блика и дымки.
    if (шар.current) материал.uniforms.camPos.value.copy(шар.current.worldToLocal(camera.position.clone()));
  });
  return (
    <mesh ref={шар} material={материал} name="земля">
      <sphereGeometry args={[R, 128, 128]} />
    </mesh>
  );
}

function Облака() {
  const облака = useLoader(THREE.TextureLoader, "/earth/clouds.webp");
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.012;
  });
  return (
    <mesh ref={ref} scale={1.012}>
      <sphereGeometry args={[R, 96, 96]} />
      <meshLambertMaterial map={облака} transparent depthWrite={false} opacity={0.9} />
    </mesh>
  );
}

/** Свечение атмосферы снаружи — ярче со стороны солнца. */
function Атмосфера() {
  const материал = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: { sunDir: { value: СОЛНЦЕ } },
        vertexShader: `varying vec3 vN; varying vec3 vObjN; void main(){ vObjN = normalize(normal); vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 sunDir; varying vec3 vN; varying vec3 vObjN; void main(){ float i = pow(0.68 - dot(vN, vec3(0.0,0.0,1.0)), 2.6); float day = 0.35 + 0.65 * smoothstep(-0.3, 0.5, dot(vObjN, sunDir)); gl_FragColor = vec4(0.32, 0.6, 1.0, 1.0) * i * day; }`,
      }),
    [],
  );
  return (
    <mesh scale={1.14}>
      <sphereGeometry args={[R, 96, 96]} />
      <primitive object={материал} attach="material" />
    </mesh>
  );
}

function Дуга({ от, смещение }: { от: THREE.Vector3; смещение: number }) {
  const до = useMemo(() => точка(ТАШКЕНТ.шир, ТАШКЕНТ.долг, R * 1.003), []);
  const кривая = useMemo(() => {
    const середина = от.clone().add(до).multiplyScalar(0.5);
    const высота = 1 + от.distanceTo(до) * 0.26;
    середина.normalize().multiplyScalar(R * высота);
    return new THREE.QuadraticBezierCurve3(от, середина, до);
  }, [от, до]);
  const труба = useMemo(() => new THREE.TubeGeometry(кривая, 64, 0.006, 8, false), [кривая]);
  const огонёк = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const т = (clock.elapsedTime * 0.2 + смещение) % 1;
    огонёк.current?.position.copy(кривая.getPoint(т));
  });
  return (
    <group>
      <mesh geometry={труба}>
        <meshBasicMaterial color="#ffd27a" transparent opacity={0.75} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={огонёк}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#fff6d8" />
      </mesh>
    </group>
  );
}

function Планета({ подписи }: { подписи: boolean }) {
  // Разворачиваем Землю Узбекистаном к зрителю.
  const поворот = useMemo(() => {
    const v = точка(ТАШКЕНТ.шир, ТАШКЕНТ.долг);
    return Math.atan2(-v.x, v.z);
  }, []);
  const ташкент = useMemo(() => точка(ТАШКЕНТ.шир, ТАШКЕНТ.долг, R * 1.004), []);
  const пульс = useRef<THREE.Mesh>(null);
  // Подписи прячутся за Землёй. Раньше это делал occlude у <Html> —
  // луч по шару из 32 тысяч треугольников для каждой подписи на каждом
  // кадре (≈12 мс). Шар выпуклый, поэтому хватает знака скалярного
  // произведения: точка видна, если смотрит в сторону камеры.
  const шар = useRef<THREE.Group>(null);
  const ярлыки = useRef<(HTMLDivElement | null)[]>([]);
  const точкиГородов = useMemo(() => ГОРОДА.map((г) => точка(г.шир, г.долг, R * 1.003)), []);
  const мир = useMemo(() => new THREE.Vector3(), []);
  const наКамеру = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    const g = шар.current;
    if (!g || !подписи) return;
    наКамеру.copy(camera.position).normalize();
    точкиГородов.forEach((p, i) => {
      const el = ярлыки.current[i];
      if (!el) return;
      мир.copy(p).applyMatrix4(g.matrixWorld).normalize();
      const к = мир.dot(наКамеру);
      el.style.opacity = String(Math.max(0, Math.min(1, (к - 0.12) / 0.15)));
    });
  });
  useFrame(({ clock }) => {
    const s = 1 + ((clock.elapsedTime * 0.8) % 1) * 2.4;
    if (пульс.current) {
      пульс.current.scale.setScalar(s);
      (пульс.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - (s - 1) / 2.4);
    }
  });
  const ориентация = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), ташкент.clone().normalize()),
    [ташкент],
  );
  return (
    <group ref={шар} rotation={[НАКЛОН, поворот, 0]}>
      <Земля />
      <Облака />
      <Атмосфера />
      {/* Солнце для облаков — в координатах Земли, вращается вместе с ней. */}
      <directionalLight position={СОЛНЦЕ.clone().multiplyScalar(10).toArray()} intensity={2.2} />
      <group position={ташкент} quaternion={ориентация}>
        <mesh>
          <circleGeometry args={[0.035, 32]} />
          <meshBasicMaterial color="#ffd27a" />
        </mesh>
        <mesh ref={пульс}>
          <ringGeometry args={[0.035, 0.05, 32]} />
          <meshBasicMaterial color="#ffd27a" transparent />
        </mesh>
      </group>
      {ГОРОДА.map((г, n) => {
        const p = точкиГородов[n];
        return (
          <group key={г.имя}>
            <mesh position={p}>
              <sphereGeometry args={[0.022, 12, 12]} />
              <meshBasicMaterial color="#9ff3ea" />
            </mesh>
            <Дуга от={p} смещение={n / ГОРОДА.length} />
            {подписи && (
              <Html position={p.clone().multiplyScalar(1.05)} center zIndexRange={[20, 0]}>
                <div
                  ref={(el) => {
                    ярлыки.current[n] = el;
                  }}
                  className="pointer-events-none whitespace-nowrap rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white"
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
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.4], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.06} />
        <Stars radius={60} depth={30} count={2500} factor={3} fade speed={0.4} />
        <Suspense fallback={null}>
          <Планета подписи={широкий} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.35}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
