"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_D } from "./ui";

/**
 * Кинематографичная 3D-заставка при запуске: «UZBEKISTAN — ONE JOURNEY».
 *
 * Одна цельная сцена, а не слайд-шоу:
 *   тёмный фон бренда → знак «собирается» линиями и искрами → оживает и
 *   становится порталом → из него в глубину (настоящий 3D через
 *   perspective + translateZ) вылетают города и карта Узбекистана → всё
 *   схлопывается обратно в знак → камера пролетает сквозь него в приложение.
 *
 * 3D — на CSS-трансформациях, а не на тяжёлом WebGL: только transform и
 * opacity, всё на композиторе, 60 кадров на обычном телефоне. Свой логотип
 * (LOGO_D) и фирменные цвета берём как есть, ничего не выдумываем.
 *
 * Первый запуск — полная версия (~5.4 с). Дальше — короткая (~1.6 с):
 * повторять шоу целиком каждый раз назойливо. Касание в любом месте
 * досматривает мгновенно.
 */

/** Кадры городов — уже грузятся в приложении, поэтому не мигают «нет фото». */
const И = (id: string) => `https://images.unsplash.com/photo-${id}?w=560&q=70&auto=format&fit=crop`;
const ГОРОДА = [
  { src: И("1664602078796-68ee76b3fc59"), city: "Самарканд", x: -128, y: -150, z: 220, r: -9, d: 1.55 },
  { src: И("1728029062560-4b0e2b958885"), city: "Бухара", x: 150, y: -120, z: 320, r: 8, d: 1.78 },
  { src: И("1653023102302-247f5f0fbdd1"), city: "Хива", x: -168, y: 120, z: 180, r: 7, d: 2.02 },
  { src: И("1654861857666-1e8c438cbe4a"), city: "Ташкент", x: 156, y: 150, z: 300, r: -8, d: 2.26 },
  { src: И("1719995153986-63e529a32585"), city: "Горы", x: 0, y: -212, z: 130, r: 3, d: 2.5 },
  { src: И("1622030797403-fa221ce5d208"), city: "Шёлковый путь", x: 8, y: 205, z: 240, r: -4, d: 2.72 },
];

/** Искры вокруг логотипа — задаём разброс один раз. */
const ИСКРЫ = Array.from({ length: 20 }, (_, i) => {
  const угол = (i / 20) * Math.PI * 2;
  const радиус = 120 + (i % 4) * 34;
  return {
    x: Math.cos(угол) * радиус,
    y: Math.sin(угол) * радиус,
    d: 0.05 + (i % 5) * 0.06,
    s: 3 + (i % 3),
    цвет: ["#3fe0dc", "#d4ff4f", "#F2CE6E"][i % 3],
  };
});

/** Стилизованный контур Узбекистана — не карта Google, а линия бренда. */
const КАРТА_D =
  "M14 64 L40 52 L60 58 L86 44 L120 40 L150 30 L184 40 L212 34 L236 46 L250 62 " +
  "L238 78 L250 92 L232 104 L200 100 L176 112 L150 106 L128 118 L98 112 L70 122 " +
  "L44 110 L26 92 L34 76 Z";
/** Точки городов на контуре — для «маршрутов». */
const ТОЧКИ = [
  [60, 58], [120, 40], [150, 30], [184, 40], [212, 34], [176, 112], [98, 112],
];

const БИРЮЗА = "#3fe0dc";
const ЛАЙМ = "#d4ff4f";
const ЗОЛОТО = "#F2CE6E";

const T = "translate(50 50) scale(0.66) translate(-85.5 -99)";

export default function IntroCinematic({
  onDone,
  full = true,
}: {
  onDone: () => void;
  /** Полная сцена (первый запуск) или короткая (повторный). */
  full?: boolean;
}) {
  const [уходит, setУходит] = useState(false);
  const завершено = useRef(false);

  const ДЛИНА = full ? 5400 : 1650; // мс до перехода
  const УХОД = 650; // длительность «пролёта сквозь логотип»

  const финиш = useRef(() => {});
  финиш.current = () => {
    if (завершено.current) return;
    завершено.current = true;
    setУходит(true);
    window.setTimeout(onDone, УХОД);
  };

  useEffect(() => {
    // Уважаем «уменьшить движение»: показываем знак и коротко уходим.
    const мало =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => финиш.current(), мало ? 700 : ДЛИНА);
    return () => window.clearTimeout(t);
  }, [ДЛИНА]);

  const кадры = full ? ГОРОДА : [];

  return (
    <div
      onClick={() => финиш.current()}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 42%, #0b1a1b 0%, #061011 55%, #03080a 100%)",
        perspective: "1100px",
        opacity: уходит ? 0 : 1,
        transition: `opacity ${УХОД}ms ease`,
        cursor: "pointer",
      }}
      aria-label="Заставка"
    >
      {/* Дышащее свечение бренда за сценой. */}
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${БИРЮЗА}44, transparent 62%)`,
          filter: "blur(46px)",
          animation: "intro-breathe 6s ease-in-out infinite",
          willChange: "transform, opacity",
        }}
      />

      {/* 3D-сцена. Камера в конце «проходит» сквозь логотип. */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          animation: уходит
            ? `intro-portal ${УХОД}ms cubic-bezier(.5,0,.9,.6) forwards`
            : full
              ? "intro-camera 5.4s ease-in-out both"
              : "none",
          willChange: "transform",
        }}
      >
        {/* «Космос»: города и карта. В конце схлопывается в центр — то есть
            в логотип. Схлопыванием родителя тянем всех детей в одну точку. */}
        <div
          className="absolute left-1/2 top-[42%]"
          style={{
            transformStyle: "preserve-3d",
            animation: full ? "intro-collapse 5.4s ease-in-out both" : "none",
            willChange: "transform, opacity",
          }}
        >
          {кадры.map((г) => (
            <div
              key={г.city}
              className="absolute overflow-hidden rounded-2xl"
              style={{
                width: 150,
                height: 194,
                left: -75,
                top: -97,
                transformStyle: "preserve-3d",
                // Каждый кадр «вылетает» из центра на свою глубину.
                transform: `translate3d(${г.x}px, ${г.y}px, ${г.z}px) rotateY(${г.r}deg) scale(0)`,
                opacity: 0,
                boxShadow: `0 20px 60px rgba(0,0,0,.55), 0 0 0 1px ${БИРЮЗА}55, 0 0 34px ${БИРЮЗА}33`,
                animation: `intro-city 2.4s cubic-bezier(.2,.8,.2,1) ${г.d}s both`,
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

          {/* Карта-линия Узбекистана: контур рисуется, точки городов
              соединяются маршрутами — «Explore Uzbekistan». */}
          {full && (
            <svg
              width={264}
              height={152}
              viewBox="0 0 264 152"
              className="absolute"
              style={{
                left: -132,
                top: -76,
                transform: "translateZ(60px)",
                animation: "intro-map 2.6s ease-in-out 2.7s both",
                willChange: "opacity, transform",
              }}
            >
              <path
                d={КАРТА_D}
                fill="none"
                stroke={ЛАЙМ}
                strokeWidth={1.6}
                pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "intro-draw 1.4s ease 2.8s forwards" }}
              />
              {ТОЧКИ.map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={2.6}
                  fill={ЗОЛОТО}
                  style={{ opacity: 0, animation: `intro-dot 0.5s ease ${3.2 + i * 0.09}s both` }}
                />
              ))}
            </svg>
          )}
        </div>

        {/* ЛОГОТИП — сердце сцены. Стоит в центре, собирается линиями,
            оживает, принимает в себя весь Узбекистан и становится порталом. */}
        <div
          className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
          style={{
            transformStyle: "preserve-3d",
            animation: full ? "intro-logo 5.4s ease-in-out both" : "intro-logo-short 1.6s ease-out both",
            willChange: "transform, opacity, filter",
          }}
        >
          <svg width={168} height={168} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="intro-sweep-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={БИРЮЗА} />
                <stop offset="50%" stopColor={ЛАЙМ} />
                <stop offset="100%" stopColor={БИРЮЗА} />
              </linearGradient>
            </defs>
            {/* Контур «рисуется» — знак собирается. */}
            <path
              d={LOGO_D}
              transform={T}
              fill="none"
              stroke={БИРЮЗА}
              strokeWidth={1.1}
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: 1,
                filter: `drop-shadow(0 0 6px ${БИРЮЗА})`,
                animation: full
                  ? "intro-draw 1s ease .1s forwards"
                  : "intro-draw .8s ease 0s forwards",
              }}
            />
            {/* Заливка знака проступает следом. */}
            <path
              d={LOGO_D}
              transform={T}
              fill="url(#intro-sweep-grad)"
              fillRule="evenodd"
              style={{
                opacity: 0,
                animation: full ? "intro-fill 1s ease .8s both" : "intro-fill .7s ease .5s both",
              }}
            />
            {/* Золотая звезда-искра в нише знака. */}
            <circle cx={50} cy={44} r={4.4} fill={ЗОЛОТО}
              style={{ opacity: 0, filter: `drop-shadow(0 0 5px ${ЗОЛОТО})`, animation: full ? "intro-fill 1s ease 1.1s both" : "intro-fill .6s ease .7s both" }} />
          </svg>
        </div>
      </div>

      {/* Искры — «световые частицы» вокруг знака. */}
      {full &&
        ИСКРЫ.map((и, n) => (
          <span
            key={n}
            className="pointer-events-none absolute left-1/2 top-[42%] rounded-full"
            style={{
              width: и.s,
              height: и.s,
              marginLeft: -и.s / 2,
              marginTop: -и.s / 2,
              background: и.цвет,
              boxShadow: `0 0 8px ${и.цвет}`,
              transform: `translate(${и.x}px, ${и.y}px)`,
              opacity: 0,
              ["--sx" as string]: `${и.x}px`,
              ["--sy" as string]: `${и.y}px`,
              animation: `intro-spark 2.2s ease-in-out ${и.d}s both`,
              willChange: "transform, opacity",
            }}
          />
        ))}

      {/* Тонкая подпись перед входом. */}
      {full && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[16%] text-center"
          style={{ animation: "intro-tagline 1.5s ease 4.0s both" }}
        >
          <p
            className="text-[12px] font-bold uppercase"
            style={{ letterSpacing: "0.42em", color: "rgba(255,255,255,0.92)", textShadow: `0 0 18px ${БИРЮЗА}` }}
          >
            Discover Uzbekistan
          </p>
          <p className="mt-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            Открой красоту Узбекистана
          </p>
        </div>
      )}

      {/* Подсказка «пропустить» — ненавязчиво, после первой секунды. */}
      {full && !уходит && (
        <span
          className="pointer-events-none absolute right-4 top-4 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.5)", animation: "intro-fill .6s ease 1.2s both" }}
        >
          Пропустить ›
        </span>
      )}
    </div>
  );
}
