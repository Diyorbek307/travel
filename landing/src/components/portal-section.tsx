"use client";

import { useEffect, useRef, useState } from "react";
import { useЯзык, type Ключ } from "@/lib/i18n";

const ФАКТЫ: [Ключ, Ключ][] = [
  ["portal_f1_t", "portal_f1_s"],
  ["portal_f2_t", "portal_f2_s"],
  ["portal_f3_t", "portal_f3_s"],
];

const РЕГИСТАН =
  "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=2400&q=80&auto=format&fit=crop";

/**
 * «Шагните в Регистан»: на кремовом листе — стрельчатая арка, как
 * портал медресе. Пока человек листает, арка растёт, пока не станет
 * окном во весь экран, — и мы будто входим на площадь. Фото внутри
 * стоит на месте (обратный масштаб), двигается только рамка.
 * Потом поверх фото один за другим выходят факты.
 */
export default function PortalSection() {
  const { t } = useЯзык();
  const обёртка = useRef<HTMLElement>(null);
  const [п, setП] = useState(0);

  useEffect(() => {
    const el = обёртка.current;
    if (!el) return;
    let кадр = 0;
    const при = () => {
      cancelAnimationFrame(кадр);
      кадр = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setП(Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight))));
      });
    };
    при();
    window.addEventListener("scroll", при, { passive: true });
    window.addEventListener("resize", при);
    return () => {
      window.removeEventListener("scroll", при);
      window.removeEventListener("resize", при);
      cancelAnimationFrame(кадр);
    };
  }, []);

  // 0…0.55 — арка растёт до «во весь экран», дальше — факты.
  const рост = Math.min(1, п / 0.55);
  const плавно = 1 - Math.pow(1 - рост, 3);
  const масштаб = 0.34 + плавно * 2.3;
  const фаза = Math.max(0, (п - 0.55) / 0.45);
  const шаг = Math.min(ФАКТЫ.length - 1, Math.floor(фаза * ФАКТЫ.length));

  return (
    <section ref={обёртка} id="portal" className="relative h-[320vh]">
      <div className="paper-grain sticky top-0 h-[100svh] overflow-hidden">
        {/* Заголовок над аркой — уходит, когда входим */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[9%] z-10 text-center"
          style={{ opacity: Math.max(0, 1 - рост * 3), transform: `translateY(${-рост * 60}px)` }}
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: "var(--accent-ink)" }}
          >
            {t("portal_kicker")}
          </p>
          <h2 className="serif text-[clamp(2.2rem,5vw,4.4rem)] font-semibold leading-none">
            {t("portal_title")}
          </h2>
        </div>

        {/* Арка-портал */}
        <div
          className="absolute left-1/2 top-1/2 h-[78svh] w-[min(62svh,86vw)] will-change-transform"
          style={{ transform: `translate(-50%, -46%) scale(${масштаб})` }}
        >
          <svg className="absolute h-0 w-0" aria-hidden>
            <clipPath id="арка" clipPathUnits="objectBoundingBox">
              <path d="M0,1 V0.42 C0,0.2 0.22,0.06 0.5,0 C0.78,0.06 1,0.2 1,0.42 V1 Z" />
            </clipPath>
          </svg>
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: "url(#арка)" }}>
            <img
              src={РЕГИСТАН}
              alt="Registan, Samarkand"
              className="absolute left-1/2 top-1/2 h-[112svh] w-[112vw] max-w-none object-cover"
              style={{ transform: `translate(-50%, -50%) scale(${1 / масштаб})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, rgba(12,8,5,${0.25 + фаза * 0.6}) 0%, rgba(12,8,5,${
                  0.1 + фаза * 0.15
                }) 55%, transparent 100%)`,
              }}
            />
          </div>
          {/* Изразцовая кайма арки — видна, пока арка маленькая */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ opacity: 1 - рост }}
            aria-hidden
          >
            <path
              d="M0,100 V42 C0,20 22,6 50,0 C78,6 100,20 100,42 V100"
              fill="none"
              stroke="#0fb3ac"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Факты поверх площади */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[12%] z-10 mx-auto max-w-3xl px-6 text-center text-white">
          {ФАКТЫ.map(([з, под], n) => (
            <div
              key={з}
              className="absolute inset-x-6 bottom-0 transition-all duration-700"
              style={{
                opacity: фаза > 0.02 && шаг === n ? 1 : 0,
                transform: `translateY(${шаг === n ? 0 : шаг > n ? -30 : 30}px)`,
              }}
            >
              <p className="hand mb-1 text-3xl" style={{ color: "var(--gold)" }}>
                0{n + 1}
              </p>
              <p className="serif text-[clamp(1.8rem,4vw,3.2rem)] font-semibold leading-tight drop-shadow-lg">
                {t(з)}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/85 drop-shadow">
                {t(под)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
