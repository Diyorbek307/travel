"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/lang-provider";
import { GOLD } from "@/lib/theme";

/**
 * Экран после регистрации. Тумблер «включает» приложение: из темноты
 * разливается неоновое свечение, за ним проявляется Узбекистан.
 *
 * Референс — ART MODE: до переключения всё серое и плоское, после —
 * цветной ореол с отражением на «полу». Переключает человек сам: то,
 * что он нажал сам, запоминается лучше автоплея.
 */

/** Кадры фона. Сменяются медленно, с наездом — получается «видео». */
const КАДРЫ = [
  "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=1200&h=1600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1605702680753-4c6a5c1e3e0f?w=1200&h=1600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1601793001849-3bc0c31d3d8e?w=1200&h=1600&fit=crop&auto=format",
];

export default function WelcomeWow({ name, onDone }: { name?: string; onDone: () => void }) {
  const { t } = useT();
  const [вкл, setВкл] = useState(false);
  const [кадр, setКадр] = useState(0);

  // Слайды крутим только после включения — до этого фон намеренно мёртвый.
  useEffect(() => {
    if (!вкл) return;
    const id = setInterval(() => setКадр((k) => (k + 1) % КАДРЫ.length), 2600);
    return () => clearInterval(id);
  }, [вкл]);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "#05070a" }}>
      {/* Фон: до включения обесцвечен и придавлен, после — оживает. */}
      <div className="absolute inset-0">
        {КАДРЫ.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: вкл ? (i === кадр ? 0.55 : 0) : 0.08,
              filter: вкл ? "saturate(1.15)" : "grayscale(1) brightness(0.5)",
              transform: `scale(${вкл && i === кадр ? 1.12 : 1})`,
              transition: "opacity 1.6s ease, filter 1.4s ease, transform 6s linear",
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 80% at 50% 38%, transparent 0%, rgba(3,5,8,0.82) 70%, #03050a 100%)" }}
        />
      </div>

      {/* Ореол — тот самый неон из референса. Смещение даём только inline:
          у Tailwind v4 -translate-* пишет в отдельное свойство translate и
          складывается с transform, из-за чего свечение уезжало из центра. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "50%",
          top: "38%",
          width: 300,
          height: 300,
          marginLeft: -150,
          marginTop: -150,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg,#ff2d9b,#ffb03a,#d4ff4f,#3fe0dc,#4f8bff,#ff2d9b)",
          filter: "blur(58px)",
          opacity: вкл ? 0.55 : 0,
          transform: вкл ? "scale(1)" : "scale(0.35)",
          transition: "opacity 1.1s ease, transform 1.1s cubic-bezier(.2,.8,.2,1)",
          animation: вкл ? "wow-glow 9s linear infinite" : undefined,
        }}
      />
      {/* Отражение «на полу» — как в референсе, под тумблером. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "50%",
          top: "52%",
          width: 260,
          height: 90,
          marginLeft: -130,
          borderRadius: "50%",
          background:
            "conic-gradient(from 180deg,#3fe0dc,#d4ff4f,#ffb03a,#ff2d9b,#3fe0dc)",
          filter: "blur(34px)",
          opacity: вкл ? 0.3 : 0,
          transition: "opacity 1.4s ease .3s",
          animation: вкл ? "wow-reflect 9s linear infinite" : undefined,
        }}
      />

      {/* Виньетка поверх свечения: без неё ореол заливает весь экран
          пастелью и «чёрной сцены» из референса не получается. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(52% 32% at 50% 38%, transparent 0%, rgba(4,6,10,0.55) 58%, rgba(3,5,8,0.9) 100%)",
          opacity: вкл ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
        {/* Тумблер */}
        <button
          onClick={() => setВкл(true)}
          aria-pressed={вкл}
          className="relative mb-4"
          style={{ width: 132, height: 60 }}
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: вкл
                ? "conic-gradient(from 0deg,#ff2d9b,#ffb03a,#d4ff4f,#3fe0dc,#4f8bff,#ff2d9b)"
                : "rgba(255,255,255,0.06)",
              border: вкл ? "none" : "1.5px solid rgba(255,255,255,0.22)",
              boxShadow: вкл ? "0 0 46px 6px rgba(212,255,79,0.45)" : "none",
              transition: "background .5s ease, box-shadow .6s ease",
              animation: вкл ? "wow-ring 4s linear infinite" : undefined,
            }}
          />
          <span
            className="absolute top-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 46,
              height: 46,
              left: вкл ? 78 : 8,
              background: вкл ? "#07090c" : "#ffffff",
              boxShadow: вкл ? "inset 0 0 0 1px rgba(255,255,255,0.08)" : "0 2px 8px rgba(0,0,0,0.4)",
              transition: "left .5s cubic-bezier(.2,.9,.2,1), background .4s ease",
            }}
          />
        </button>

        <p
          className="text-[10px] font-bold uppercase"
          style={{ letterSpacing: "0.34em", color: вкл ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)", transition: "color .6s ease" }}
        >
          UZROAM MODE
        </p>

        {/* Текст и кнопка появляются только после включения. */}
        <div
          style={{
            opacity: вкл ? 1 : 0,
            transform: вкл ? "translateY(0)" : "translateY(14px)",
            transition: "opacity .9s ease .45s, transform .9s cubic-bezier(.2,.8,.2,1) .45s",
            pointerEvents: вкл ? "auto" : "none",
          }}
          className="mt-10 w-full max-w-sm"
        >
          <h1 className="text-white" style={{ fontFamily: "'Fraunces',serif", fontSize: 32, lineHeight: 1.15 }}>
            {t("wow_welcome")}
            {name ? "," : ""}
            {name ? <><br /><span style={{ color: GOLD }}>{name}</span></> : null}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{t("wow_sub")}</p>
          <button
            onClick={onDone}
            className="mt-8 w-full rounded-2xl py-4 text-sm font-bold transition-all active:scale-[0.97]"
            style={{
              color: "#05070a",
              background: "linear-gradient(120deg,#d4ff4f,#3fe0dc)",
              boxShadow: "0 10px 34px rgba(63,224,220,0.35)",
            }}
          >
            {t("wow_go")} <span className="rtl-flip inline-block">→</span>
          </button>
        </div>

        {/* Подсказка до включения. */}
        <p
          className="absolute bottom-16 text-xs"
          style={{ color: "rgba(255,255,255,0.42)", opacity: вкл ? 0 : 1, transition: "opacity .4s ease" }}
        >
          {t("wow_tap")}
        </p>
      </div>
    </div>
  );
}
