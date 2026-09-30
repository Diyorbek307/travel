"use client";

import { APP_URL, useЯзык, type Ключ } from "@/lib/i18n";
import Reveal from "./reveal";
import { Фонарик } from "./effects";

/**
 * «Всё, что нужно знать»: восемь коротких памяток перед поездкой.
 * Тексты сверены с путеводителем приложения (src/data/guides.ts) —
 * цифры и правила те же, чтобы сайт и приложение не спорили друг с другом.
 */
const ПАМЯТКИ: { знак: string; з: Ключ; т: Ключ }[] = [
  { знак: "🛂", з: "know_1_t", т: "know_1_s" },
  { знак: "🏨", з: "know_2_t", т: "know_2_s" },
  { знак: "💵", з: "know_3_t", т: "know_3_s" },
  { знак: "📶", з: "know_4_t", т: "know_4_s" },
  { знак: "🚄", з: "know_5_t", т: "know_5_s" },
  { знак: "🚕", з: "know_6_t", т: "know_6_s" },
  { знак: "🌸", з: "know_7_t", т: "know_7_s" },
  { знак: "🕌", з: "know_8_t", т: "know_8_s" },
];

export default function Essentials() {
  const { t } = useЯзык();
  return (
    <section id="know" className="paper-grain relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p
              className="mb-5 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: "var(--accent-ink)" }}
            >
              {t("know_kicker")}
            </p>
            <h2 className="serif mb-6 text-[clamp(2.2rem,4vw,3.6rem)] font-semibold leading-[1.02]">
              {t("know_title")}
            </h2>
            <p className="mb-8 max-w-sm text-[15px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              {t("know_text")}
            </p>
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(14,166,159,0.55)] transition-transform hover:scale-[1.03]"
              style={{ background: "var(--accent-ink)" }}
            >
              {t("know_more")}
              <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180">→</span>
            </a>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ПАМЯТКИ.map((п, n) => (
            <Reveal key={п.з} delay={(n % 2) * 0.08}>
              <Фонарик
                className="group h-full overflow-hidden rounded-[26px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(7,104,95,0.5)]"
                style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.72)" }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110"
                    style={{ background: "var(--cream)" }}
                  >
                    {п.знак}
                  </span>
                  <span className="condensed text-3xl font-bold" style={{ color: "var(--sand)" }}>
                    0{n + 1}
                  </span>
                </div>
                <h3 className="serif mb-2 text-xl font-semibold">{t(п.з)}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {t(п.т)}
                </p>
              </Фонарик>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
