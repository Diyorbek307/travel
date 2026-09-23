"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_D } from "./ui";

/**
 * Кинематографичная заставка запуска: «UZBEKISTAN — ONE JOURNEY».
 *
 * Хореография:
 *   1. Камера реально летит над городами Узбекистана — настоящие
 *      дрон-ролики (city1, city2), плавно перетекающие друг в друга.
 *   2. Вспышка неонового света — переход.
 *   3. Финал: знак-окно. Внутри его границ идут флешбеки — кадры городов
 *      (весь Узбекистан внутри знака), обведённые белым свечением.
 *   4. Кадры гаснут, знак становится сплошным белым и мягко светится;
 *      неон коротко «дышит».
 *   5. Знак уменьшается по центру и садится точь-в-точь на логотип шапки —
 *      открывается приложение.
 *
 * Только transform/opacity + пара видео — плавно на телефоне. Свой
 * логотип (LOGO_D) и белый цвет, ролики и фото — из проекта.
 * Касание досматривает мгновенно; уважает reduced-motion.
 */

const И = (id: string) => `https://images.unsplash.com/photo-${id}?w=560&q=72&auto=format&fit=crop`;
/** Кадры-флешбеки внутри знака (уже грузятся в приложении). */
const ФЛЕШ = [
  И("1664602078796-68ee76b3fc59"),
  И("1728029062560-4b0e2b958885"),
  И("1653023102302-247f5f0fbdd1"),
  И("1654861857666-1e8c438cbe4a"),
];

const T = "translate(50 50) scale(0.66) translate(-85.5 -99)";

/** Маска в форме знака — сквозь неё видно кадры городов «внутри логотипа». */
const МАСКА_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${LOGO_D}' transform='${T}' fill='white' fill-rule='evenodd'/></svg>`;
const МАСКА = `url("data:image/svg+xml,${encodeURIComponent(МАСКА_SVG)}")`;

/** Реперы времени, мс. */
const ОКНО = 4200; // появляется знак-окно с кадрами
const БЕЛЫЙ = 5500; // знак становится сплошным белым
const ДЛИНА = 6500;
const УХОД = 780;

export default function IntroCinematic({ onDone }: { onDone: () => void }) {
  const [уходит, setУходит] = useState(false);
  const завершено = useRef(false);

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
    const t = window.setTimeout(() => финиш.current(), мало ? 1000 : ДЛИНА);
    return () => window.clearTimeout(t);
  }, []);

  const маска = {
    WebkitMaskImage: МАСКА,
    maskImage: МАСКА,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  } as const;

  return (
    <div
      onClick={() => финиш.current()}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background: "#000", opacity: уходит ? 0 : 1, transition: `opacity ${УХОД}ms ease`, cursor: "pointer" }}
      aria-label="Заставка"
    >
      {/* ── 1. Пролёт камеры над городами (настоящие дрон-ролики) ── */}
      <video
        src="/videos/city1.mp4"
        autoPlay muted loop playsInline preload="auto" controls={false} disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
        style={{ animation: "intro-vidA 4.5s ease forwards, intro-kenburns 5s ease-out forwards", willChange: "opacity, transform" }}
      />
      <video
        src="/videos/city2.mp4"
        autoPlay muted loop playsInline preload="auto" controls={false} disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0, animation: "intro-vidB 4.5s ease forwards, intro-kenburns 5s ease-out forwards", willChange: "opacity, transform" }}
      />
      {/* Лёгкое затемнение по краям — кинематографичность и читаемость. */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 100% at 50% 45%, transparent 40%, rgba(0,0,0,.55) 100%)", animation: "intro-vidA 4.5s ease forwards" }} />

      {/* ── 2. Вспышка неонового света — переход к финалу ── */}
      <div
        className="pointer-events-none absolute left-1/2 top-[46%]"
        style={{
          width: 420, height: 420, marginLeft: -210, marginTop: -210, borderRadius: "50%",
          background: "radial-gradient(circle, #ffffff 0%, #ffffff88 26%, transparent 64%)",
          filter: "blur(24px)", opacity: 0,
          animation: `intro-flash 1.3s ease ${(ОКНО - 350) / 1000}s both`,
          willChange: "transform, opacity",
        }}
      />

      {/* ── 3–5. Финал: знак-окно → белый знак → посадка в шапку ──
          Обёртка «посадки»: в самом конце уезжает и уменьшается точно в
          логотип шапки приложения (слева вверху). */}
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: "50% 46%",
          transform: уходит ? "translate(calc(48px - 50vw), calc(76px - 46vh)) scale(0.2)" : "none",
          transition: `transform ${УХОД}ms cubic-bezier(.5,.1,.25,1)`,
          willChange: "transform",
        }}
      >
        {/* Центрированная группа знака. Сначала уменьшается по центру. */}
        <div
          className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
          style={{ width: 232, height: 232, animation: `intro-final 2.3s cubic-bezier(.2,.8,.2,1) ${ОКНО / 1000}s both`, willChange: "transform, opacity" }}
        >
          {/* Мягкое белое неоновое свечение позади — «дышит». */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 250, height: 250, borderRadius: "50%",
              background: "radial-gradient(circle, #ffffffb0 0%, #ffffff40 34%, transparent 64%)",
              filter: "blur(30px)",
              animation: `intro-neon 2.6s ease-in-out ${(ОКНО + 200) / 1000}s infinite`,
              willChange: "transform, opacity",
            }}
          />

          {/* Кадры городов ВНУТРИ границ знака (маска по форме логотипа). */}
          <div className="absolute inset-0" style={{ ...маска, opacity: 0, animation: `intro-window 1.9s ease ${ОКНО / 1000}s both` }}>
            {ФЛЕШ.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: 0, animation: `intro-flash-img 5.6s ease ${(ОКНО / 1000) + i * 0.55}s both`, willChange: "opacity, transform" }}
                draggable={false}
              />
            ))}
          </div>

          {/* Сплошной БЕЛЫЙ знак — проступает, когда кадры гаснут. */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ overflow: "visible", opacity: 0, animation: `intro-white 1s ease ${БЕЛЫЙ / 1000}s both` }}>
            <path d={LOGO_D} transform={T} fill="#ffffff" fillRule="evenodd"
              style={{ filter: "drop-shadow(0 0 4px #ffffffcc) drop-shadow(0 0 14px #ffffff88)" }} />
          </svg>

          {/* Белый светящийся контур — рамка знака-окна на протяжении финала. */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
            <path d={LOGO_D} transform={T} fill="none" stroke="#ffffff" strokeWidth={1.1} pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1, filter: "drop-shadow(0 0 6px #ffffffcc)", animation: `intro-draw 1s ease ${(ОКНО - 100) / 1000}s forwards` }} />
          </svg>
        </div>
      </div>

      {/* Подпись перед входом. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[14%] text-center"
        style={{ animation: `intro-tagline 1.6s ease ${(БЕЛЫЙ + 100) / 1000}s both` }}
      >
        <p className="text-[12px] font-bold uppercase" style={{ letterSpacing: "0.42em", color: "rgba(255,255,255,0.95)", textShadow: "0 0 16px #ffffff88" }}>
          Discover Uzbekistan
        </p>
        <p className="mt-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>Открой красоту Узбекистана</p>
      </div>

      {!уходит && (
        <span className="pointer-events-none absolute right-4 top-4 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.5)", animation: "intro-fill .6s ease .8s both" }}>
          Пропустить ›
        </span>
      )}
    </div>
  );
}
