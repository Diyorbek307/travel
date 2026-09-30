"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useЯзык, type Ключ } from "@/lib/i18n";

// three.js тяжёлый — грузим только когда секция близко, и только в браузере.
const СценаКупола = dynamic(() => import("./three/dome-canvas"), { ssr: false });

const ФАКТЫ: [Ключ, Ключ][] = [
  ["dome_f1_t", "dome_f1_s"],
  ["dome_f2_t", "dome_f2_s"],
  ["dome_f3_t", "dome_f3_s"],
  ["dome_f4_t", "dome_f4_s"],
];

/**
 * Гур-Эмир в 3D. Секция в три экрана высотой, внутри — «липкий» кадр:
 * пока человек листает, кадр стоит, купол делает оборот, а факты
 * сменяют друг друга. Прогресс считаем от прокрутки окна (Lenis двигает
 * именно её), поэтому никаких лишних библиотек.
 */
export default function DomeSection() {
  const { t } = useЯзык();
  const обёртка = useRef<HTMLElement>(null);
  const прогресс = useRef(0);
  const [шаг, setШаг] = useState(0);
  const [грузить, setГрузить] = useState(false);

  useEffect(() => {
    const el = обёртка.current;
    if (!el) return;
    // Начинаем грузить 3D за экран до секции.
    const наб = new IntersectionObserver(([e]) => e.isIntersecting && setГрузить(true), {
      rootMargin: "100% 0px",
    });
    наб.observe(el);
    let кадр = 0;
    const при = () => {
      cancelAnimationFrame(кадр);
      кадр = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const всего = r.height - window.innerHeight;
        const п = Math.min(1, Math.max(0, -r.top / всего));
        прогресс.current = п;
        setШаг(Math.min(ФАКТЫ.length - 1, Math.floor(п * ФАКТЫ.length)));
      });
    };
    при();
    window.addEventListener("scroll", при, { passive: true });
    return () => {
      наб.disconnect();
      window.removeEventListener("scroll", при);
      cancelAnimationFrame(кадр);
    };
  }, []);

  return (
    <section
      ref={обёртка}
      id="dome"
      className="relative h-[300vh]"
      style={{ background: "linear-gradient(180deg,#fbf6ef,#f1e1c8 60%,#ecd5b3)" }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* Солнце за куполом */}
        <div
          className="pointer-events-none absolute left-1/2 top-[42%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,206,140,0.85), rgba(255,206,140,0) 65%)" }}
        />
        <div className="absolute inset-0 top-[30%] lg:left-[40%] lg:top-0">
          {грузить && <СценаКупола прогресс={прогресс} />}
        </div>

        <div className="pointer-events-none relative mx-auto w-full max-w-7xl px-5 sm:px-8">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: "var(--brick)" }}
          >
            {t("dome_kicker")}
          </p>
          <h2 className="serif mb-10 max-w-lg text-[clamp(2rem,3.4vw,3.1rem)] font-semibold leading-[1.05]">
            {t("dome_title")}
          </h2>
          <div className="relative h-40 max-w-sm">
            {ФАКТЫ.map(([з, п], n) => (
              <div
                key={з}
                className="absolute inset-0 transition-all duration-700"
                style={{
                  opacity: шаг === n ? 1 : 0,
                  transform: `translateY(${шаг === n ? 0 : шаг > n ? -24 : 24}px)`,
                }}
              >
                <p className="hand text-3xl" style={{ color: "var(--tile)" }}>
                  0{n + 1}
                </p>
                <p className="serif text-2xl font-semibold">{t(з)}</p>
                <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {t(п)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            {ФАКТЫ.map((_, n) => (
              <span
                key={n}
                className="h-1 rounded-full transition-all duration-500"
                style={{ width: шаг === n ? 36 : 12, background: шаг === n ? "var(--tile)" : "var(--line)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
