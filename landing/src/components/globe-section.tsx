"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useЯзык, ЯЗЫКИ } from "@/lib/i18n";
import { Шахматка } from "./cinema";
import Reveal from "./reveal";

const СценаГлобуса = dynamic(() => import("./three/globe-canvas"), { ssr: false });

/** «10 языков — 10 направлений»: 3D-глобус с дугами к Узбекистану. */
export default function GlobeSection() {
  const { t } = useЯзык();
  const место = useRef<HTMLDivElement>(null);
  const [грузить, setГрузить] = useState(false);
  useEffect(() => {
    const наб = new IntersectionObserver(([e]) => e.isIntersecting && setГрузить(true), {
      rootMargin: "100% 0px",
    });
    if (место.current) наб.observe(место.current);
    return () => наб.disconnect();
  }, []);

  return (
    <section
      id="globe"
      data-nav="dark"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: "radial-gradient(ellipse at 70% 50%, #13201e, #070c0b 72%)" }}
    >
      <Шахматка цвет="#f4f7f7" />
      {/* Звёздная пыль */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #fff8, transparent), radial-gradient(1px 1px at 70% 20%, #fff6, transparent), radial-gradient(1.5px 1.5px at 40% 80%, #fff7, transparent), radial-gradient(1px 1px at 85% 65%, #fff5, transparent), radial-gradient(1px 1px at 10% 70%, #fff6, transparent)",
          backgroundSize: "400px 400px",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: "var(--gold)" }}
          >
            {t("globe_kicker")}
          </p>
          <h2 className="serif mb-6 text-[clamp(2.2rem,4.4vw,3.8rem)] font-semibold leading-[1.02] text-white">
            {t("globe_title")}
          </h2>
          <p className="mb-8 max-w-md text-[15px] leading-relaxed text-white/70">{t("globe_text")}</p>
          <div className="flex flex-wrap gap-2">
            {ЯЗЫКИ.map((я) => (
              <span
                key={я.код}
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/85"
              >
                {я.флаг} {я.имя}
              </span>
            ))}
          </div>
        </Reveal>
        <div ref={место} className="relative mx-auto aspect-square w-full max-w-[640px]">
          {грузить && <СценаГлобуса />}
        </div>
      </div>
    </section>
  );
}
