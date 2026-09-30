"use client";

import { APP_URL, useЯзык, type Ключ } from "@/lib/i18n";
import Reveal from "./reveal";
import { Магнит } from "./effects";

/**
 * «Как начать»: три шага без скачивания. У приложения есть manifest
 * (display: standalone) и service worker — его правда можно поставить
 * на экран телефона, в магазинах его пока нет, поэтому про них молчим.
 */
const ШАГИ: { знак: string; з: Ключ; т: Ключ }[] = [
  { знак: "🌐", з: "st_1_t", т: "st_1_s" },
  { знак: "文", з: "st_2_t", т: "st_2_s" },
  { знак: "📲", з: "st_3_t", т: "st_3_s" },
];

export default function StartSection() {
  const { t } = useЯзык();
  return (
    <section id="start" className="paper-grain relative px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {t("start_kicker")}
          </p>
          <h2 className="serif text-[clamp(2.2rem,4.4vw,3.8rem)] font-semibold leading-[1.04]">{t("start_title")}</h2>
        </Reveal>

        <div className="relative grid gap-6 md:grid-cols-3">
          {/* Пунктир пути между шагами */}
          <div
            className="pointer-events-none absolute left-[16%] right-[16%] top-11 hidden border-t-2 border-dashed md:block"
            style={{ borderColor: "var(--sand)" }}
          />
          {ШАГИ.map((ш, n) => (
            <Reveal key={ш.з} delay={n * 0.12}>
              <div className="relative text-center">
                <div
                  className="relative mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px] text-4xl"
                  style={{
                    background: "linear-gradient(145deg,#fff,var(--cream))",
                    boxShadow: "0 20px 40px -24px rgba(7,104,95,0.55), inset 0 0 0 1px var(--line)",
                  }}
                >
                  {ш.знак}
                  <span
                    className="condensed absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: "var(--accent-ink)" }}
                  >
                    {n + 1}
                  </span>
                </div>
                <h3 className="serif mb-2 text-xl font-semibold">{t(ш.з)}</h3>
                <p className="mx-auto max-w-xs text-[14.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {t(ш.т)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-[28px] border p-6 text-center sm:p-8" style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.75)" }}>
            <div className="grid w-full gap-3 text-[14px] sm:grid-cols-2">
              {(["st_ios", "st_android"] as const).map((к) => (
                <p key={к} className="rounded-2xl px-4 py-3 font-medium" style={{ background: "var(--cream)" }}>
                  {t(к)}
                </p>
              ))}
            </div>
            <Магнит>
              <a
                href={APP_URL}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(14,166,159,0.55)] transition-transform hover:scale-[1.03]"
                style={{ background: "var(--accent-ink)" }}
              >
                {t("hero_cta")}
                <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180">→</span>
              </a>
            </Магнит>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
