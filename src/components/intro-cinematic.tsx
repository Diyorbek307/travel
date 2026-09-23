"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_D } from "./ui";

/**
 * Кинематографичная 3D-заставка запуска: «UZBEKISTAN — ONE JOURNEY».
 *
 * Хореография (одна цельная сцена, не слайд-шоу):
 *   1. Тёмный экран, знака ещё НЕТ.
 *   2. Камера летит СКВОЗЬ города Узбекистана: каждый вылетает из
 *      глубины, налетает и проносится мимо — Самарканд → Бухара → Хива →
 *      Ташкент → горы → Шёлковый путь. Настоящий пролёт (translateZ +
 *      perspective), а не карусель картинок.
 *   3. Мелькает линия-карта страны.
 *   4. В финале всё стягивается лучами в одну точку — сжимается в узел.
 *   5. Из узла рождается знак приложения и неоново горит на чёрном.
 *   6. Камера пролетает сквозь знак — открывается приложение.
 *
 * 3D — на CSS (perspective + translateZ + preserve-3d), только transform
 * и opacity: 60 к/с на телефоне, без тяжёлого WebGL. Свой логотип
 * (LOGO_D) и фирменные цвета (бирюза/лайм/золото) — как есть; фото
 * городов — те, что уже грузятся в приложении.
 *
 * Первый запуск — полная (~6 с), дальше короткая (~1.9 с, только знак).
 * Касание досматривает мгновенно; уважает reduced-motion.
 */

const И = (id: string) => `https://images.unsplash.com/photo-${id}?w=680&q=72&auto=format&fit=crop`;
/** Города по ходу пролёта: fx/fy — снос от центра, fr — наклон, d — задержка. */
const ГОРОДА = [
  { src: И("1664602078796-68ee76b3fc59"), city: "Самарканд", fx: -30, fy: -18, fr: -6, d: 0.35 },
  { src: И("1728029062560-4b0e2b958885"), city: "Бухара", fx: 42, fy: 28, fr: 5, d: 0.77 },
  { src: И("1653023102302-247f5f0fbdd1"), city: "Хива", fx: -46, fy: 26, fr: 6, d: 1.19 },
  { src: И("1654861857666-1e8c438cbe4a"), city: "Ташкент", fx: 36, fy: -30, fr: -5, d: 1.61 },
  { src: И("1719995153986-63e529a32585"), city: "Горы", fx: 0, fy: -12, fr: 2, d: 2.03 },
  { src: И("1622030797403-fa221ce5d208"), city: "Шёлковый путь", fx: 12, fy: 22, fr: -3, d: 2.45 },
];

const БИРЮЗА = "#3fe0dc";
const ЛАЙМ = "#d4ff4f";
const ЗОЛОТО = "#F2CE6E";

const КАРТА_D =
  "M14 64 L40 52 L60 58 L86 44 L120 40 L150 30 L184 40 L212 34 L236 46 L250 62 " +
  "L238 78 L250 92 L232 104 L200 100 L176 112 L150 106 L128 118 L98 112 L70 122 " +
  "L44 110 L26 92 L34 76 Z";
const ТОЧКИ = [[60, 58], [120, 40], [150, 30], [184, 40], [212, 34], [176, 112], [98, 112]];

const T = "translate(50 50) scale(0.66) translate(-85.5 -99)";

/** Реперы времени полной сцены, мс. */
const РЕЙ = 3400; // лучи схождения
const ЗНАК = 4200; // знак разгорается
const ДЛИНА_ПОЛН = 6000;
const УХОД = 700;

export default function IntroCinematic({
  onDone,
  full = true,
}: {
  onDone: () => void;
  full?: boolean;
}) {
  const [уходит, setУходит] = useState(false);
  const завершено = useRef(false);
  const ДЛИНА = full ? ДЛИНА_ПОЛН : 1900;

  const финиш = useRef(() => {});
  финиш.current = () => {
    if (завершено.current) return;
    завершено.current = true;
    setУходит(true);
    window.setTimeout(onDone, УХОД);
  };

  useEffect(() => {
    const мало =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => финиш.current(), мало ? 900 : ДЛИНА);
    return () => window.clearTimeout(t);
  }, [ДЛИНА]);

  return (
    <div
      onClick={() => финиш.current()}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{
        background: "#000",
        perspective: "1000px",
        opacity: уходит ? 0 : 1,
        transition: `opacity ${УХОД}ms ease`,
        cursor: "pointer",
      }}
      aria-label="Заставка"
    >
      {/* Фон: тёплая бирюзовая мгла на время пролёта, к финалу — чистый чёрный. */}
      {full && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(120% 90% at 50% 46%, #0a1a1b 0%, #05100f 55%, #000 100%)",
            animation: "intro-bg 6s ease forwards",
          }}
        />
      )}

      {/* 3D-сцена. */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          animation: уходит ? "none" : full ? "intro-camera 6s ease-in-out both" : "none",
          willChange: "transform",
        }}
      >
        {/* Тоннель пролёта: города налетают из глубины и проносятся мимо. */}
        {full && (
          <div className="absolute left-1/2 top-[46%]" style={{ transformStyle: "preserve-3d" }}>
            {ГОРОДА.map((г) => (
              <div
                key={г.city}
                className="absolute overflow-hidden rounded-3xl"
                style={{
                  width: 288,
                  height: 372,
                  left: -144,
                  top: -186,
                  transformStyle: "preserve-3d",
                  transform: "translate3d(0,0,-1400px)",
                  opacity: 0,
                  boxShadow: `0 30px 80px rgba(0,0,0,.7), 0 0 0 1px ${БИРЮЗА}44, 0 0 44px ${БИРЮЗА}2e`,
                  animation: `intro-fly 1.6s cubic-bezier(.35,0,.65,1) ${г.d}s both`,
                  willChange: "transform, opacity",
                  ["--fx" as string]: `${г.fx}px`,
                  ["--fy" as string]: `${г.fy}px`,
                  ["--fr" as string]: `${г.fr}deg`,
                }}
              >
                <img src={г.src} alt="" className="h-full w-full object-cover" draggable={false} />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,.72), transparent 55%)" }}
                />
                <span
                  className="absolute bottom-3 left-4 text-sm font-bold tracking-wide text-white"
                  style={{ fontFamily: "'Fraunces',serif", textShadow: "0 1px 8px rgba(0,0,0,.7)" }}
                >
                  {г.city}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Линия-карта Узбекистана — короткий росчерк перед схождением. */}
        {full && (
          <svg
            width={264}
            height={152}
            viewBox="0 0 264 152"
            className="absolute left-1/2 top-[46%]"
            style={{
              marginLeft: -132,
              marginTop: -76,
              animation: "intro-map 1.7s ease-in-out 2.7s both",
              willChange: "opacity",
            }}
          >
            <path
              d={КАРТА_D}
              fill="none"
              stroke={ЛАЙМ}
              strokeWidth={1.8}
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1, filter: `drop-shadow(0 0 4px ${ЛАЙМ})`, animation: "intro-draw 1.1s ease 2.8s forwards" }}
            />
            {ТОЧКИ.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={2.8} fill={ЗОЛОТО}
                style={{ opacity: 0, animation: `intro-dot 0.45s ease ${3.0 + i * 0.06}s both` }} />
            ))}
          </svg>
        )}

        {/* Лучи схождения — спицы света стягиваются к центру. */}
        {full && (
          <div
            className="pointer-events-none absolute left-1/2 top-[46%]"
            style={{
              width: 620,
              height: 620,
              marginLeft: -310,
              marginTop: -310,
              borderRadius: "50%",
              background: `repeating-conic-gradient(from 0deg, transparent 0deg, ${БИРЮЗА}00 6deg, ${БИРЮЗА}66 8deg, ${ЛАЙМ}00 10deg)`,
              WebkitMaskImage: "radial-gradient(circle, transparent 8%, #000 30%, transparent 70%)",
              maskImage: "radial-gradient(circle, transparent 8%, #000 30%, transparent 70%)",
              opacity: 0,
              animation: `intro-rays 1.5s ease-in ${РЕЙ / 1000}s both`,
              willChange: "transform, opacity",
            }}
          />
        )}

        {/* Вспышка-узел, из которого рождается знак. */}
        {full && (
          <div
            className="pointer-events-none absolute left-1/2 top-[46%]"
            style={{
              width: 300,
              height: 300,
              marginLeft: -150,
              marginTop: -150,
              borderRadius: "50%",
              background: `radial-gradient(circle, #ffffff 0%, ${БИРЮЗА} 22%, ${ЛАЙМ}00 60%)`,
              filter: "blur(14px)",
              opacity: 0,
              animation: `intro-flash 1.4s ease ${(ЗНАК - 250) / 1000}s both`,
              willChange: "transform, opacity",
            }}
          />
        )}

        {/* Обёртка «посадки»: в финале знак уменьшается и уезжает в угол —
            туда, где стоит логотип шапки приложения. Начало кадра — без
            трансформа (identity), поэтому переход без рывка. */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "50% 46%",
            transform: уходит ? "translate(calc(48px - 50vw), calc(76px - 46vh)) scale(0.2)" : "none",
            transition: `transform ${УХОД}ms cubic-bezier(.5,.1,.25,1)`,
            willChange: "transform",
          }}
        >
        {/* ЗНАК — рождается в финале и неоново горит на чёрном. */}
        <div
          className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
          style={{
            transformStyle: "preserve-3d",
            animation: full
              ? `intro-logo 2s cubic-bezier(.2,.8,.2,1) ${ЗНАК / 1000}s both`
              : "intro-logo-short 1.9s cubic-bezier(.2,.8,.2,1) both",
            willChange: "transform, opacity",
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: `radial-gradient(circle, #ffffff 0%, #ffffffcc 12%, ${БИРЮЗА} 34%, ${ЛАЙМ}33 56%, transparent 72%)`,
              filter: "blur(26px)",
              animation: full
                ? `intro-neon 2.4s ease-in-out ${(ЗНАК + 300) / 1000}s infinite`
                : "intro-neon 2.4s ease-in-out .8s infinite",
              willChange: "transform, opacity",
            }}
          />
          <svg width={176} height={176} viewBox="0 0 100 100" className="relative" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="intro-neon-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={ЛАЙМ} />
                <stop offset="55%" stopColor={БИРЮЗА} />
                <stop offset="100%" stopColor={БИРЮЗА} />
              </linearGradient>
            </defs>
            <path
              d={LOGO_D}
              transform={T}
              fill="url(#intro-neon-grad)"
              fillRule="evenodd"
              style={{ filter: `drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 10px #ffffffcc) drop-shadow(0 0 20px ${БИРЮЗА}) drop-shadow(0 0 40px ${ЛАЙМ}aa)` }}
            />
            <circle cx={50} cy={44} r={4.6} fill="#ffffff" style={{ filter: `drop-shadow(0 0 6px ${ЗОЛОТО}) drop-shadow(0 0 3px #fff)` }} />
          </svg>
        </div>
        </div>
      </div>

      {/* Подпись перед входом. */}
      {full && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[15%] text-center"
          style={{ animation: `intro-tagline 1.6s ease ${(ЗНАК + 500) / 1000}s both` }}
        >
          <p className="text-[12px] font-bold uppercase"
            style={{ letterSpacing: "0.42em", color: "rgba(255,255,255,0.94)", textShadow: `0 0 18px ${БИРЮЗА}` }}>
            Discover Uzbekistan
          </p>
          <p className="mt-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            Открой красоту Узбекистана
          </p>
        </div>
      )}

      {full && !уходит && (
        <span
          className="pointer-events-none absolute right-4 top-4 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.45)", animation: "intro-fill .6s ease 1s both" }}
        >
          Пропустить ›
        </span>
      )}
    </div>
  );
}
