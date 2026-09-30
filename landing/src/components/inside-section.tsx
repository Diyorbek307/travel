"use client";

import { APP_URL, useЯзык, type Ключ } from "@/lib/i18n";
import Reveal from "./reveal";
import { Фонарик } from "./effects";

/**
 * «Одно приложение вместо десяти»: двенадцать возможностей HelloUZ.
 * Всё перечисленное есть в приложении и бесплатно (платны только Premium
 * и eSIM — о них отдельный раздел), поэтому у каждой — метка «Бесплатно».
 */
const ВОЗМОЖНОСТИ: { знак: string; з: Ключ; т: Ключ }[] = [
  { знак: "🗺️", з: "in_1_t", т: "in_1_s" },
  { знак: "🎧", з: "in_2_t", т: "in_2_s" },
  { знак: "✨", з: "in_3_t", т: "in_3_s" },
  { знак: "📷", з: "in_4_t", т: "in_4_s" },
  { знак: "🗣️", з: "in_5_t", т: "in_5_s" },
  { знак: "📅", з: "in_6_t", т: "in_6_s" },
  { знак: "🟢", з: "in_7_t", т: "in_7_s" },
  { знак: "🚄", з: "in_8_t", т: "in_8_s" },
  { знак: "🚕", з: "in_9_t", т: "in_9_s" },
  { знак: "💱", з: "in_10_t", т: "in_10_s" },
  { знак: "📴", з: "in_11_t", т: "in_11_s" },
  { знак: "🏅", з: "in_12_t", т: "in_12_s" },
];

export default function InsideSection() {
  const { t } = useЯзык();
  return (
    <section id="inside" className="paper-grain relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-14 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p
              className="mb-5 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: "var(--accent-ink)" }}
            >
              {t("inside_kicker")}
            </p>
            <h2 className="serif text-[clamp(2.3rem,4.6vw,4rem)] font-semibold leading-[1.02]">
              {t("inside_title")}
            </h2>
          </div>
          <p className="max-w-lg text-[16px] leading-relaxed lg:justify-self-end" style={{ color: "var(--ink-soft)" }}>
            {t("inside_text")}
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ВОЗМОЖНОСТИ.map((в, n) => (
            <Reveal key={в.з} delay={(n % 4) * 0.07}>
              <Фонарик
                className="group flex h-full flex-col rounded-[24px] border p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-30px_rgba(7,104,95,0.55)]"
                style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.74)" }}
              >
                <div className="mb-4 flex items-start justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                    style={{ background: "linear-gradient(135deg, var(--cream), #fff)" }}
                  >
                    {в.знак}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: "rgba(15,179,172,0.12)", color: "var(--accent-ink)" }}
                  >
                    {t("badge_free")}
                  </span>
                </div>
                <h3 className="serif mb-2 text-lg font-semibold leading-snug">{t(в.з)}</h3>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {t(в.т)}
                </p>
              </Фонарик>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <a
            href={APP_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(14,166,159,0.55)] transition-transform hover:scale-[1.03]"
            style={{ background: "var(--accent-ink)" }}
          >
            {t("open_app")}
            <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
