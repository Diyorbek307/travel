"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_D, STAR_D, STAR_GOLD } from "./ui";

/**
 * Кинематографичная заставка запуска: «UZBEKISTAN — ONE JOURNEY».
 *
 *   1. Камера летит над городами — настоящие дрон-ролики, перетекающие
 *      друг в друга.
 *   2. Видео «вырезается» в знак: логотип во весь экран, внутри — город.
 *   3. Знак плавно уменьшается к центру; внутри мелькают флешбеки городов,
 *      вокруг — белое свечение контура.
 *   4. Кадры гаснут, знак становится сплошным белым; по нему проходит
 *      блик неона.
 *   5. Знак садится точь-в-точь на логотип шапки (по его реальным
 *      координатам) и подменяется им — приложение открыто.
 *
 * Центрирование — через margin, а не классы translate: в Tailwind v4 они
 * задают отдельное свойство `translate`, которое складывалось с
 * transform из кадров и уводило знак влево-вверх.
 */

const И = (id: string) => `https://images.unsplash.com/photo-${id}?w=560&q=72&auto=format&fit=crop`;
/** Флешбеки внутри знака (фото уже грузятся в приложении). */
const ФЛЕШ = [
  И("1664602078796-68ee76b3fc59"),
  И("1728029062560-4b0e2b958885"),
  И("1653023102302-247f5f0fbdd1"),
  И("1654861857666-1e8c438cbe4a"),
];

const T = "translate(50 50) scale(0.66) translate(-85.5 -99)";
const T_STAR = `${T} translate(85 84.5) scale(1.15) translate(-85 -84.5)`;

/** Маска в форме знака — сквозь неё видно город «внутри логотипа». */
const МАСКА_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${LOGO_D}' transform='${T}' fill='white' fill-rule='evenodd'/></svg>`;
const МАСКА = `url("data:image/svg+xml,${encodeURIComponent(МАСКА_SVG)}")`;
const маска = {
  WebkitMaskImage: МАСКА,
  maskImage: МАСКА,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
} as const;

/** Реперы времени, мс. */
const ОКНО = 3300; // видео «вырезается» в большой знак
const ФЛЕШ_СТАРТ = 4000; // флешбеки внутри знака
const БЕЛЫЙ = 5500; // знак становится белым
const БЛИК = 6000; // блик неона перед посадкой
const ДЛИНА = 6700;
const УХОД = 820;

/** Доля знака внутри квадрата viewBox 100×100 (из bbox пути × 0.66). */
const ЗНАК_Ш = 0.812;
const ЗНАК_В = 0.911;

export default function IntroCinematic({ onDone }: { onDone: () => void }) {
  const [уходит, setУходит] = useState(false);
  const [посадка, setПосадка] = useState<{ origin: string; transform: string } | null>(null);
  // Размер знака и стартовый масштаб «во весь экран» — от размера экрана.
  const [размер, setРазмер] = useState({ S: 232, k0: 2 });
  const старт = useRef(0);
  const завершено = useRef(false);
  const группаRef = useRef<HTMLDivElement | null>(null);
  const логоRef = useRef<SVGSVGElement | null>(null);
  const видеоARef = useRef<HTMLVideoElement | null>(null);
  const видеоBRef = useRef<HTMLVideoElement | null>(null);

  const финиш = useRef(() => {});
  финиш.current = () => {
    if (завершено.current) return;
    завершено.current = true;

    // Садимся на логотип шапки, только если белый знак уже на экране;
    // при раннем пропуске просто растворяемся.
    const прошло = performance.now() - старт.current;
    const цель = Array.from(document.querySelectorAll<HTMLElement>("[data-brand-logo]")).find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const svg = логоRef.current;
    if (прошло >= БЕЛЫЙ && цель && svg) {
      if (группаRef.current) группаRef.current.style.animationPlayState = "paused";
      const a = svg.getBoundingClientRect();
      const b = цель.getBoundingClientRect();
      const ax = a.left + a.width / 2;
      const ay = a.top + a.height / 2;
      const bx = b.left + b.width / 2;
      const by = b.top + b.height / 2;
      setПосадка({
        origin: `${ax}px ${ay}px`,
        transform: `translate(${bx - ax}px, ${by - ay}px) scale(${b.width / a.width})`,
      });
    }
    setУходит(true);
    window.setTimeout(onDone, УХОД);
  };

  useEffect(() => {
    старт.current = performance.now();
    const W = window.innerWidth;
    const H = window.innerHeight;
    const S = Math.round(Math.min(W * 0.62, H * 0.42, 300));
    // «Во весь экран»: знак целиком, от края до края.
    const k0 = Math.min((W * 0.96) / (ЗНАК_Ш * S), (H * 0.9) / (ЗНАК_В * S));
    setРазмер({ S, k0: Math.max(1.4, k0) });

    // Настоящий логотип шапки прячем, пока летит наш: в конце он просто
    // подменит его на том же месте — без «двойника».
    document.documentElement.classList.add("intro-landing");

    const мало =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => финиш.current(), мало ? 1000 : ДЛИНА);
    // Фоновые ролики после «вырезания» не нужны — останавливаем, бережём батарею.
    const пауза = window.setTimeout(() => {
      видеоARef.current?.pause();
      видеоBRef.current?.pause();
    }, ОКНО + 700);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(пауза);
      document.documentElement.classList.remove("intro-landing");
    };
  }, []);

  const { S, k0 } = размер;
  const плавно = `${УХОД}ms cubic-bezier(.5,.1,.25,1)`;

  return (
    <div onClick={() => финиш.current()} className="fixed inset-0 z-[100] overflow-hidden" style={{ cursor: "pointer" }} aria-label="Заставка">
      {/* ── Подложка: чёрный фон, пролёт, подпись. Гаснет при посадке. ── */}
      <div className="absolute inset-0" style={{ background: "#000", opacity: уходит ? 0 : 1, transition: `opacity ${плавно}` }}>
        <video
          ref={видеоARef}
          src="/videos/city1.mp4"
          autoPlay muted loop playsInline preload="auto" controls={false} disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover"
          style={{ animation: "intro-vidA 3.8s ease forwards, intro-kenburns 3.8s ease-out forwards", willChange: "opacity, transform" }}
        />
        <video
          ref={видеоBRef}
          src="/videos/city2.mp4"
          autoPlay muted loop playsInline preload="auto" controls={false} disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0, animation: "intro-vidB 3.8s ease forwards, intro-kenburns 3.8s ease-out forwards", willChange: "opacity, transform" }}
        />
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 100% at 50% 50%, transparent 42%, rgba(0,0,0,.55) 100%)", animation: "intro-vidA 3.8s ease forwards" }} />

        <div className="pointer-events-none absolute inset-x-0 bottom-[12%] text-center"
          style={{ animation: `intro-tagline 1.5s ease ${(БЕЛЫЙ + 100) / 1000}s both` }}>
          <p className="text-[12px] font-bold uppercase" style={{ letterSpacing: "0.42em", color: "rgba(255,255,255,0.95)", textShadow: "0 0 16px #ffffff88" }}>
            Discover Uzbekistan
          </p>
          <p className="mt-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>Открой красоту Узбекистана</p>
        </div>

        <span className="pointer-events-none absolute right-4 top-4 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.5)", animation: "intro-fill .6s ease .8s both" }}>
          Пропустить ›
        </span>
      </div>

      {/* ── Знак. Обёртка посадки: в конце летит в логотип шапки. ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transformOrigin: посадка?.origin ?? "50% 50%",
          transform: уходит && посадка ? посадка.transform : "none",
          opacity: уходит && !посадка ? 0 : 1,
          transition: `transform ${плавно}, opacity ${плавно}`,
          willChange: "transform",
        }}
      >
        {/* Группа строго по центру (margin, не translate-классы). */}
        <div
          ref={группаRef}
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            width: S,
            height: S,
            marginLeft: -S / 2,
            marginTop: -S / 2,
            ["--k0" as string]: k0,
            animation: `intro-final ${(ДЛИНА - ОКНО) / 1000}s linear ${ОКНО / 1000}s both`,
            willChange: "transform, opacity",
          }}
        >
          {/* Мягкое белое свечение позади белого знака. */}
          <div className="absolute" style={{
            left: "50%", top: "50%", width: S * 1.15, height: S * 1.15, marginLeft: -S * 0.575, marginTop: -S * 0.575,
            opacity: уходит ? 0 : undefined, transition: `opacity ${плавно}`,
            animation: `intro-white .7s ease ${БЕЛЫЙ / 1000}s both`,
          }}>
            <div className="h-full w-full rounded-full" style={{
              background: "radial-gradient(circle, #ffffffa8 0%, #ffffff38 36%, transparent 66%)",
              filter: "blur(28px)",
              animation: `intro-neon 2.4s ease-in-out ${БЕЛЫЙ / 1000}s infinite`,
              willChange: "transform, opacity",
            }} />
          </div>

          {/* Город ВНУТРИ границ знака: продолжение пролёта + флешбеки. */}
          <div className="absolute inset-0" style={{ ...маска, animation: `intro-window ${(БЕЛЫЙ + 400 - ОКНО) / 1000}s ease ${ОКНО / 1000}s both` }}>
            <video
              src="/videos/city2.mp4"
              autoPlay muted loop playsInline preload="auto" controls={false} disablePictureInPicture
              className="absolute inset-0 h-full w-full object-cover"
            />
            {ФЛЕШ.map((src, i) => (
              <img key={src} src={src} alt="" draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: 0, animation: `intro-flash-img 1.4s ease ${ФЛЕШ_СТАРТ / 1000 + i * 0.36}s both`, willChange: "opacity, transform" }} />
            ))}
          </div>

          {/* Сплошной белый знак (+ золотая звезда проступает при посадке,
              как у логотипа шапки). */}
          <svg ref={логоRef} viewBox="0 0 100 100" className="absolute inset-0 h-full w-full"
            style={{ overflow: "visible", opacity: 0, animation: `intro-white .6s ease ${БЕЛЫЙ / 1000}s both` }}>
            <path d={LOGO_D} transform={T} fill="#ffffff" fillRule="evenodd"
              style={{
                filter: уходит ? "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" : "drop-shadow(0 0 4px #ffffffcc) drop-shadow(0 0 14px #ffffff88)",
                transition: `filter ${плавно}`,
              }} />
            <g transform={T_STAR}>
              <path d={STAR_D} fill={STAR_GOLD} style={{ opacity: уходит ? 1 : 0, transition: `opacity ${плавно}` }} />
            </g>
          </svg>

          {/* Блик неона — полоса света пробегает по знаку перед посадкой. */}
          <div className="absolute inset-0" style={{
            ...маска,
            background: "linear-gradient(110deg, transparent 38%, rgba(255,255,255,.95) 50%, transparent 62%)",
            backgroundSize: "260% 100%",
            opacity: 0,
            animation: `intro-shimmer .75s ease-in-out ${БЛИК / 1000}s both`,
          }} />

          {/* Белый светящийся контур — рамка знака-окна. */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full"
            style={{ overflow: "visible", opacity: уходит ? 0 : 1, transition: `opacity ${плавно}` }}>
            <path d={LOGO_D} transform={T} fill="none" stroke="#ffffff" strokeWidth={0.9} pathLength={1}
              vectorEffect="non-scaling-stroke"
              style={{ strokeDasharray: 1, strokeDashoffset: 1, filter: "drop-shadow(0 0 5px #ffffffcc)", animation: `intro-draw 1.2s ease ${ОКНО / 1000}s forwards` }} />
          </svg>
        </div>
      </div>
    </div>
  );
}
