"use client";

import { useEffect, useRef, useState } from "react";
import { useЯзык, type Ключ } from "@/lib/i18n";
import Reveal from "./reveal";
import { Счёт } from "./effects";

/**
 * «95% HelloUZ — бесплатно». Платны только две вещи, и обе по желанию:
 * Premium (без рекламы и скидки у партнёров, 39 000 сум/мес — как в окне
 * Premium приложения) и eSIM (платят за сам пакет интернета). Всё
 * остальное — бесплатно и без регистрации. Цифру 95% назвал владелец.
 */
const БЕСПЛАТНО: Ключ[] = ["fl_1", "fl_2", "fl_3", "fl_4", "fl_5", "fl_6", "fl_7", "fl_8"];

function Кольцо() {
  const ref = useRef<SVGSVGElement>(null);
  const [видно, setВидно] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const наб = new IntersectionObserver(([e]) => e.isIntersecting && (setВидно(true), наб.disconnect()), {
      threshold: 0.4,
    });
    наб.observe(el);
    return () => наб.disconnect();
  }, []);
  const R = 88;
  const длина = 2 * Math.PI * R;
  return (
    <svg ref={ref} viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden>
      <defs>
        <linearGradient id="free-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0fb3ac" />
          <stop offset="0.6" stopColor="#2fd0c6" />
          <stop offset="1" stopColor="#e9c46a" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(13,23,21,0.08)" strokeWidth="14" />
      <circle
        cx="100"
        cy="100"
        r={R}
        fill="none"
        stroke="url(#free-ring)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={длина}
        strokeDashoffset={видно ? длина * 0.05 : длина}
        style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}

export default function FreeSection() {
  const { t } = useЯзык();
  return (
    <section id="free" className="relative overflow-clip px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--cream)" }}>
      <div
        className="aurora -right-32 top-10 h-[380px] w-[380px]"
        style={{ background: "rgba(233,196,106,0.35)" }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="text-center lg:text-start">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {t("free_kicker")}
          </p>
          <h2 className="serif mb-6 text-[clamp(2.3rem,4.6vw,4rem)] font-semibold leading-[1.02]">
            {t("free_title")}
          </h2>
          <p className="mx-auto mb-10 max-w-md text-[16px] leading-relaxed lg:mx-0" style={{ color: "var(--ink-soft)" }}>
            {t("free_text")}
          </p>
          <div className="relative mx-auto h-64 w-64 sm:h-72 sm:w-72 lg:mx-0">
            <Кольцо />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="serif text-7xl font-semibold tabular-nums leading-none" style={{ color: "var(--accent-ink)" }}>
                <Счёт до={95} />%
              </p>
              <p className="mt-2 max-w-[9rem] text-center text-xs font-medium" style={{ color: "var(--ink-soft)" }}>
                {t("free_ring")}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          <Reveal>
            <div
              className="h-full rounded-[28px] p-7 text-white"
              style={{ background: "linear-gradient(150deg, var(--accent-deep), #0a8f88 60%, var(--accent))" }}
            >
              <p className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">✓</span>
                {t("free_col_free")}
              </p>
              <ul className="space-y-3">
                {БЕСПЛАТНО.map((к) => (
                  <li key={к} className="flex items-start gap-3 text-[15px] leading-snug">
                    <span className="mt-0.5 text-[var(--gold)]">✦</span>
                    {t(к)}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col gap-4">
              <p className="px-1 text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--ink-soft)" }}>
                {t("free_col_paid")}
              </p>
              {[
                { знак: "👑", з: "paid_prem_t", т: "paid_prem_s" },
                { знак: "📶", з: "paid_esim_t", т: "paid_esim_s" },
              ].map((п) => (
                <div
                  key={п.з}
                  className="flex-1 rounded-[24px] border p-6"
                  style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.8)" }}
                >
                  <p className="mb-2 flex items-center gap-2 font-semibold">
                    <span className="text-xl">{п.знак}</span>
                    {t(п.з as Ключ)}
                  </p>
                  <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    {t(п.т as Ключ)}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
