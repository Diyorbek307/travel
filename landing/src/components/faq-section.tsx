"use client";

import { useState } from "react";
import { useЯзык, type Ключ } from "@/lib/i18n";
import Reveal from "./reveal";

/**
 * Вопросы и ответы. Каждый ответ сверен с приложением: что платно,
 * где удаляется аккаунт, как идёт оплата (страницы Payme и Click —
 * см. src/lib/payments.ts приложения). Ответ раскрывается плавно:
 * grid-template-rows 0fr → 1fr, без замера высоты в JS.
 */
const ВОПРОСЫ = Array.from({ length: 10 }, (_, i) => [`q${i + 1}`, `a${i + 1}`] as [Ключ, Ключ]);

export default function FaqSection() {
  const { t } = useЯзык();
  const [открыт, setОткрыт] = useState(0);
  return (
    <section id="faq" className="relative px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--cream)" }}>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {t("faq_kicker")}
          </p>
          <h2 className="serif text-[clamp(2.2rem,4.2vw,3.6rem)] font-semibold leading-[1.04]">{t("faq_title")}</h2>
          <p className="hand mt-6 text-3xl" style={{ color: "var(--accent-ink)" }}>
            ? → !
          </p>
        </Reveal>

        <div className="space-y-3">
          {ВОПРОСЫ.map(([в, о], n) => {
            const да = открыт === n;
            return (
              <Reveal key={в} delay={Math.min(n, 5) * 0.04}>
                <div
                  className="overflow-hidden rounded-[22px] border transition-all duration-300"
                  style={{
                    borderColor: да ? "transparent" : "var(--line)",
                    background: да ? "#fff" : "rgba(255,255,255,0.6)",
                    boxShadow: да ? "0 24px 50px -30px rgba(7,104,95,0.5)" : "none",
                  }}
                >
                  <button
                    onClick={() => setОткрыт(да ? -1 : n)}
                    aria-expanded={да}
                    className="flex w-full items-center gap-4 px-5 py-4 text-start sm:px-6"
                  >
                    <span className="flex-1 text-[16px] font-semibold">{t(в)}</span>
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg transition-all duration-300"
                      style={{
                        background: да ? "var(--accent-ink)" : "var(--sand)",
                        color: да ? "#fff" : "var(--ink)",
                        transform: да ? "rotate(45deg)" : "none",
                      }}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: да ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-[15px] leading-relaxed sm:px-6" style={{ color: "var(--ink-soft)" }}>
                        {t(о)}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
