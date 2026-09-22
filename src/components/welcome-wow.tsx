"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/lang-provider";
import { GOLD } from "@/lib/theme";
import { ФОН_ВИДЕО } from "@/data/city-reels";

/**
 * Экран после регистрации. Тумблер «включает» приложение: из темноты
 * разливается неоновое свечение, за ним проявляется Узбекистан.
 *
 * Тумблер переключается сам — медленно и плавно, без нажатия: человек
 * только что прошёл регистрацию, и мы встречаем его маленьким шоу, а не
 * очередной кнопкой. Нажать раньше времени всё равно можно.
 */

/*
 * Кадры фона. Только надёжные фотографии, которые уже грузятся в других
 * экранах приложения: прежний набор содержал битую ссылку, и вместо
 * Самарканда в шапке зияла иконка «нет картинки».
 */
const КАДРЫ = [
  "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=1200&h=1700&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1728029062560-4b0e2b958885?w=1200&h=1700&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1653023102302-247f5f0fbdd1?w=1200&h=1700&fit=crop&auto=format",
];

/** Несколько парящих искр — задаём их разброс один раз. */
const ИСКРЫ = [
  { left: "18%", top: "30%", d: 0, s: 5 },
  { left: "76%", top: "26%", d: 1.4, s: 7 },
  { left: "30%", top: "64%", d: 2.6, s: 6 },
  { left: "68%", top: "60%", d: 0.8, s: 8 },
  { left: "50%", top: "20%", d: 2.0, s: 5.5 },
  { left: "12%", top: "52%", d: 3.2, s: 6.5 },
  { left: "86%", top: "48%", d: 1.1, s: 7.5 },
];

export default function WelcomeWow({ name, onDone }: { name?: string; onDone: () => void }) {
  const { t } = useT();
  const [вкл, setВкл] = useState(false);
  const [кадр, setКадр] = useState(0);
  const ужеВключали = useRef(false);

  const включить = () => {
    if (ужеВключали.current) return;
    ужеВключали.current = true;
    setВкл(true);
  };

  // Тумблер переключается сам, но не сразу: даём разглядеть тёмную
  // «сцену», а сам переход делаем небыстрым — это маленькое шоу, а не
  // мигание. Уважаем «уменьшить движение».
  useEffect(() => {
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      включить();
      return;
    }
    const id = setTimeout(включить, 2600);
    return () => clearTimeout(id);
  }, []);

  // Слайды крутим только после включения — до этого фон намеренно мёртвый.
  // Держим кадр дольше: спешка ломает ощущение плавности.
  useEffect(() => {
    if (!вкл) return;
    const id = setInterval(() => setКадр((k) => (k + 1) % КАДРЫ.length), 5000);
    return () => clearInterval(id);
  }, [вкл]);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "#04060a" }}>
      {/* Фон: до включения обесцвечен и придавлен, после — оживает.
          Когда сцена включилась, поверх кадров разгорается живое видео
          об Узбекистане; до включения его нет — фон намеренно мёртвый. */}
      <div className="absolute inset-0">
        {КАДРЫ.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: вкл ? (i === кадр ? 0.6 : 0) : 0.1,
              filter: вкл ? "saturate(1.2) contrast(1.05)" : "grayscale(1) brightness(0.45)",
              transform: `scale(${вкл && i === кадр ? 1.16 : 1.02})`,
              transition: "opacity 3s ease, filter 2.4s ease, transform 11s ease-out",
            }}
          />
        ))}
        {вкл && (
          <video
            src={ФОН_ВИДЕО}
            poster={КАДРЫ[0]}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0.5, animation: "wow-fadein 3s ease forwards" }}
          />
        )}
        {/* Мягкая аврора: цветная дымка, что медленно плывёт по верху сцены. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 40% at 30% 25%, rgba(63,224,220,0.22), transparent 60%), radial-gradient(50% 40% at 75% 30%, rgba(212,255,79,0.16), transparent 60%), radial-gradient(60% 50% at 50% 90%, rgba(255,45,155,0.14), transparent 65%)",
            opacity: вкл ? 1 : 0,
            transition: "opacity 3.4s ease",
            animation: вкл ? "wow-aurora 22s ease-in-out infinite" : undefined,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 80% at 50% 40%, transparent 0%, rgba(3,5,9,0.8) 68%, #02040a 100%)" }}
        />
      </div>

      {/*
       * Свет с четырёх сторон. Каждое пятно «вплывает» из своего края
       * экрана и потом медленно дышит — свет приходит отовсюду, а не
       * только из центра. Появляются по очереди, чтобы читалось как волна.
       */}
      {([
        { цвет: "rgba(63,224,220,0.5)", поз: "left top", off: { left: "-30%", top: "-20%" }, from: "translate(-40%,-40%)", d: "0.2s", a: "wow-side-a" },
        { цвет: "rgba(212,255,79,0.42)", поз: "right top", off: { right: "-30%", top: "-15%" }, from: "translate(40%,-40%)", d: "0.7s", a: "wow-side-b" },
        { цвет: "rgba(255,45,155,0.4)", поз: "left bottom", off: { left: "-25%", bottom: "-25%" }, from: "translate(-40%,40%)", d: "1.2s", a: "wow-side-a" },
        { цвет: "rgba(79,139,255,0.42)", поз: "right bottom", off: { right: "-28%", bottom: "-20%" }, from: "translate(40%,40%)", d: "1.7s", a: "wow-side-b" },
      ] as const).map((л, n) => (
        <div
          key={n}
          className="pointer-events-none absolute"
          style={{
            ...л.off,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: `radial-gradient(circle at ${л.поз}, ${л.цвет}, transparent 70%)`,
            filter: "blur(46px)",
            opacity: вкл ? 1 : 0,
            transform: вкл ? "translate(0,0)" : л.from,
            transition: `opacity 2.6s ease ${л.d}, transform 2.8s cubic-bezier(.2,.7,.2,1) ${л.d}`,
            animation: вкл ? `${л.a} 12s ease-in-out ${л.d} infinite` : undefined,
          }}
        />
      ))}

      {/* Внешний ореол — большой, дышащий. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "50%",
          top: "40%",
          width: 340,
          height: 340,
          marginLeft: -170,
          marginTop: -170,
          borderRadius: "50%",
          background: "conic-gradient(from 0deg,#ff2d9b,#ffb03a,#d4ff4f,#3fe0dc,#4f8bff,#ff2d9b)",
          filter: "blur(64px)",
          opacity: вкл ? 0.55 : 0,
          transform: вкл ? "scale(1)" : "scale(0.3)",
          transition: "opacity 2.2s ease, transform 2.4s cubic-bezier(.2,.8,.2,1)",
          animation: вкл ? "wow-glow 16s linear infinite, wow-breathe 8s ease-in-out infinite" : undefined,
        }}
      />
      {/* Внутреннее ядро — вращается в другую сторону, ярче: даёт глубину. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "50%",
          top: "40%",
          width: 190,
          height: 190,
          marginLeft: -95,
          marginTop: -95,
          borderRadius: "50%",
          background: "conic-gradient(from 180deg,#3fe0dc,#d4ff4f,#ffb03a,#ff2d9b,#4f8bff,#3fe0dc)",
          filter: "blur(34px)",
          opacity: вкл ? 0.75 : 0,
          transform: вкл ? "scale(1)" : "scale(0.4)",
          transition: "opacity 2.4s ease .2s, transform 2.6s cubic-bezier(.2,.8,.2,1) .2s",
          animation: вкл ? "wow-glow-rev 12s linear infinite" : undefined,
        }}
      />
      {/* Отражение «на полу» — как в референсе, под тумблером. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "50%",
          top: "55%",
          width: 280,
          height: 96,
          marginLeft: -140,
          borderRadius: "50%",
          background: "conic-gradient(from 180deg,#3fe0dc,#d4ff4f,#ffb03a,#ff2d9b,#3fe0dc)",
          filter: "blur(38px)",
          opacity: вкл ? 0.32 : 0,
          transition: "opacity 2.6s ease .5s",
          animation: вкл ? "wow-reflect 16s linear infinite" : undefined,
        }}
      />

      {/* Парящие искры — маленькое волшебство, появляются после включения. */}
      {ИСКРЫ.map((и, n) => (
        <span
          key={n}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: и.left,
            top: и.top,
            width: 4,
            height: 4,
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 0 8px 2px rgba(63,224,220,0.7)",
            opacity: вкл ? 0.8 : 0,
            transition: "opacity 2.6s ease",
            animation: вкл ? `wow-float ${и.s}s ease-in-out ${и.d}s infinite` : undefined,
          }}
        />
      ))}

      {/* Виньетка поверх свечения: без неё ореол заливает весь экран
          пастелью и «чёрной сцены» из референса не получается. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(54% 34% at 50% 40%, transparent 0%, rgba(3,5,10,0.5) 60%, rgba(2,4,10,0.9) 100%)",
          opacity: вкл ? 1 : 0,
          transition: "opacity 2.2s ease",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
        {/* Тумблер. Кликается тоже — но переключится и сам. */}
        <button
          onClick={включить}
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
              boxShadow: вкл ? "0 0 56px 8px rgba(212,255,79,0.5)" : "none",
              transition: "background 1s ease, box-shadow 1.1s ease",
              animation: вкл ? "wow-ring 7s linear infinite" : undefined,
            }}
          />
          <span
            className="absolute top-1/2 rounded-full"
            style={{
              width: 46,
              height: 46,
              marginTop: -23,
              left: вкл ? 78 : 8,
              background: вкл ? "#06080c" : "#ffffff",
              boxShadow: вкл
                ? "inset 0 0 0 1px rgba(255,255,255,0.1)"
                : "0 2px 8px rgba(0,0,0,0.4)",
              // Пружинка: колёсико чуть перелетает и возвращается — живее,
              // чем ровный переезд.
              transition: "left 1.2s cubic-bezier(.34,1.4,.4,1), background .8s ease",
            }}
          />
        </button>

        <p
          className="text-[10px] font-bold uppercase"
          style={{ letterSpacing: "0.34em", color: вкл ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)", transition: "color 1.1s ease" }}
        >
          UZROAM MODE
        </p>

        {/* Текст и кнопка появляются только после включения. */}
        <div
          style={{
            opacity: вкл ? 1 : 0,
            transform: вкл ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 1.4s ease 1s, transform 1.4s cubic-bezier(.2,.8,.2,1) 1s",
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
              boxShadow: "0 10px 40px rgba(63,224,220,0.4)",
            }}
          >
            {t("wow_go")} <span className="rtl-flip inline-block">→</span>
          </button>
        </div>

      </div>
    </div>
  );
}
