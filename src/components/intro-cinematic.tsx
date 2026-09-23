"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_D } from "./ui";

/**
 * Кинематографичная 3D-заставка запуска: «UZBEKISTAN — ONE JOURNEY».
 *
 * Хореография (одна цельная сцена, не слайд-шоу):
 *   1. Тёмный экран, знака ещё НЕТ.
 *   2. В 3D-глубине проявляются и парят города Узбекистана + линия-карта.
 *   3. В финале всё стягивается лучами в одну точку в центре — города
 *      сжимаются, как свет, в единый узел.
 *   4. Из этого узла рождается знак приложения и неоново разгорается на
 *      чёрном фоне.
 *   5. Камера пролетает сквозь знак — открывается приложение.
 *
 * 3D — на CSS (perspective + translateZ + preserve-3d), только transform
 * и opacity: 60 к/с на телефоне, без тяжёлого WebGL. Свой логотип
 * (LOGO_D) и фирменные цвета (бирюза/лайм/золото) — как есть; фото
 * городов — те, что уже грузятся в приложении.
 *
 * Первый запуск — полная версия (~6.2 с), дальше короткая (~1.9 с, только
 * неоновый знак). Касание досматривает мгновенно; уважает reduced-motion.
 */

const И = (id: string) => `https://images.unsplash.com/photo-${id}?w=560&q=70&auto=format&fit=crop`;
const ГОРОДА = [
  { src: И("1664602078796-68ee76b3fc59"), city: "Самарканд", x: -132, y: -158, z: 240, r: -10, d: 0.5 },
  { src: И("1728029062560-4b0e2b958885"), city: "Бухара", x: 152, y: -128, z: 340, r: 9, d: 0.72 },
  { src: И("1653023102302-247f5f0fbdd1"), city: "Хива", x: -172, y: 126, z: 190, r: 8, d: 0.94 },
  { src: И("1654861857666-1e8c438cbe4a"), city: "Ташкент", x: 160, y: 156, z: 320, r: -9, d: 1.16 },
  { src: И("1719995153986-63e529a32585"), city: "Горы", x: 4, y: -224, z: 140, r: 3, d: 1.38 },
  { src: И("1622030797403-fa221ce5d208"), city: "Шёлковый путь", x: 10, y: 214, z: 260, r: -4, d: 1.6 },
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

/** Реперы времени полной сцены, мс. Знак рождается только в КОЛЛАПС. */
const ГОРОДА_START = 400;
const КОЛЛАПС = 3600; // города начинают стягиваться в центр
const ЗНАК = 4300; // знак разгорается
const ДЛИНА_ПОЛН = 6200;
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
        perspective: "1150px",
        opacity: уходит ? 0 : 1,
        transition: `opacity ${УХОД}ms ease`,
        cursor: "pointer",
      }}
      aria-label="Заставка"
    >
      {/* Фон: чуть тёплая бирюзовая мгла на время городов, к финалу гаснет
          в чистый чёрный — чтобы неоновый знак горел на пустоте. */}
      {full && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(120% 90% at 50% 46%, #0a1a1b 0%, #05100f 55%, #000 100%)",
            animation: "intro-bg 6.2s ease forwards",
          }}
        />
      )}

      {/* 3D-сцена. */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          animation: уходит
            ? `intro-portal ${УХОД}ms cubic-bezier(.5,0,.9,.6) forwards`
            : full
              ? "intro-camera 6.2s ease-in-out both"
              : "none",
          willChange: "transform",
        }}
      >
        {/* «Космос» городов: проявляются, парят, затем стягиваются лучами
            в центр — сжимаются в точку, где родится знак. */}
        {full && (
          <div
            className="absolute left-1/2 top-[46%]"
            style={{
              transformStyle: "preserve-3d",
              animation: "intro-collapse 6.2s cubic-bezier(.6,0,.35,1) both",
              willChange: "transform, opacity",
            }}
          >
            {ГОРОДА.map((г) => (
              <div
                key={г.city}
                className="absolute overflow-hidden rounded-2xl"
                style={{
                  width: 150,
                  height: 194,
                  left: -75,
                  top: -97,
                  transformStyle: "preserve-3d",
                  transform: `translate3d(0,0,0) rotateY(0deg) scale(0)`,
                  opacity: 0,
                  boxShadow: `0 20px 60px rgba(0,0,0,.6), 0 0 0 1px ${БИРЮЗА}55, 0 0 36px ${БИРЮЗА}33`,
                  animation: `intro-city 3.4s cubic-bezier(.2,.8,.2,1) ${ГОРОДА_START / 1000 + г.d}s both`,
                  willChange: "transform, opacity",
                  ["--cx" as string]: `${г.x}px`,
                  ["--cy" as string]: `${г.y}px`,
                  ["--cz" as string]: `${г.z}px`,
                  ["--cr" as string]: `${г.r}deg`,
                }}
              >
                <img src={г.src} alt="" className="h-full w-full object-cover" draggable={false} />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,.72), transparent 58%)" }}
                />
                <span
                  className="absolute bottom-2 left-3 text-[11px] font-bold tracking-wide text-white"
                  style={{ fontFamily: "'Fraunces',serif", textShadow: "0 1px 6px rgba(0,0,0,.6)" }}
                >
                  {г.city}
                </span>
              </div>
            ))}

            {/* Линия-карта Узбекистана: контур рисуется, точки-города
                соединяются маршрутами. */}
            <svg
              width={264}
              height={152}
              viewBox="0 0 264 152"
              className="absolute"
              style={{
                left: -132,
                top: -76,
                transform: "translateZ(70px)",
                animation: "intro-map 2.4s ease-in-out 1.9s both",
                willChange: "opacity",
              }}
            >
              <path
                d={КАРТА_D}
                fill="none"
                stroke={ЛАЙМ}
                strokeWidth={1.6}
                pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "intro-draw 1.3s ease 2.0s forwards" }}
              />
              {ТОЧКИ.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={2.6} fill={ЗОЛОТО}
                  style={{ opacity: 0, animation: `intro-dot 0.5s ease ${2.4 + i * 0.08}s both` }} />
              ))}
            </svg>
          </div>
        )}

        {/* Лучи схождения: в момент коллапса из краёв к центру бьют
            световые спицы — «всё сходится в одну точку». */}
        {full && (
          <div
            className="pointer-events-none absolute left-1/2 top-[46%]"
            style={{
              width: 620,
              height: 620,
              marginLeft: -310,
              marginTop: -310,
              borderRadius: "50%",
              background:
                `repeating-conic-gradient(from 0deg, transparent 0deg, ${БИРЮЗА}00 6deg, ${БИРЮЗА}66 8deg, ${ЛАЙМ}00 10deg)`,
              WebkitMaskImage: "radial-gradient(circle, transparent 8%, #000 30%, transparent 70%)",
              maskImage: "radial-gradient(circle, transparent 8%, #000 30%, transparent 70%)",
              opacity: 0,
              animation: `intro-rays 1.6s ease-in ${КОЛЛАПС / 1000}s both`,
              willChange: "transform, opacity",
            }}
          />
        )}

        {/* Центральная вспышка — узел, из которого рождается знак. */}
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

        {/* ЗНАК — рождается только в финале и неоново горит на чёрном. */}
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
          {/* Неоновое свечение за знаком — пульс живёт своим слоем (дёшево). */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${БИРЮЗА}88, ${ЛАЙМ}22 45%, transparent 68%)`,
              filter: "blur(30px)",
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
            {/* Неоновая заливка знака с многослойным свечением. */}
            <path
              d={LOGO_D}
              transform={T}
              fill="url(#intro-neon-grad)"
              fillRule="evenodd"
              style={{ filter: `drop-shadow(0 0 5px ${БИРЮЗА}) drop-shadow(0 0 16px ${БИРЮЗА}) drop-shadow(0 0 30px ${ЛАЙМ}aa)` }}
            />
            {/* Золотая звезда-искра в нише. */}
            <circle cx={50} cy={44} r={4.6} fill={ЗОЛОТО}
              style={{ filter: `drop-shadow(0 0 6px ${ЗОЛОТО})` }} />
          </svg>
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
