"use client";

import { useMemo } from "react";
import { APP_URL, useЯзык, type Ключ } from "@/lib/i18n";
import Reveal from "./reveal";
import { Магнит } from "./effects";

/**
 * eSIM для Узбекистана — как работает магазин в приложении: выбор пакета,
 * оплата Payme/Click с подтверждением платёжной системы, QR-код. Только
 * интернет, без номера — так и пишем. Кнопка открывает магазин сразу:
 * «/?esim=new» (см. page.tsx приложения).
 */
const ШАГИ: [Ключ, Ключ][] = [
  ["esim_s1_t", "esim_s1_s"],
  ["esim_s2_t", "esim_s2_s"],
  ["esim_s3_t", "esim_s3_s"],
];
const ПЛЮСЫ: Ключ[] = ["esim_b1", "esim_b2", "esim_b3", "esim_b4"];

/** Узор «как QR» для макета экрана — картинка, а не настоящий код. */
function ПсевдоQR() {
  const клетки = useMemo(() => {
    const N = 21;
    const out: [number, number][] = [];
    let s = 7;
    const случ = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const угол = (x: number, y: number) =>
      (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) if (!угол(x, y) && случ() > 0.52) out.push([x, y]);
    return out;
  }, []);
  const Глаз = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width="7" height="7" fill="#0d1715" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0d1715" />
    </g>
  );
  return (
    <svg viewBox="-1 -1 23 23" className="h-full w-full" aria-hidden>
      <rect x="-1" y="-1" width="23" height="23" fill="#fff" />
      {клетки.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0d1715" />
      ))}
      <Глаз x={0} y={0} />
      <Глаз x={14} y={0} />
      <Глаз x={0} y={14} />
    </svg>
  );
}

function Телефон() {
  return (
    <div className="float relative mx-auto w-[260px] sm:w-[290px]">
      <div
        className="relative aspect-[9/19] rounded-[44px] p-3"
        style={{ background: "linear-gradient(145deg,#1b2b29,#050a09)", boxShadow: "0 50px 90px -30px rgba(0,0,0,0.7)" }}
      >
        <div className="relative h-full overflow-hidden rounded-[34px]" style={{ background: "#f4f7f7" }}>
          {/* Строка состояния: сигнал «наливается» */}
          <div className="flex items-center justify-between px-6 pt-4 text-[11px] font-bold text-[#0d1715]">
            <span>9:41</span>
            <span className="flex items-end gap-[2px]">
              {[4, 6, 8, 10].map((h, i) => (
                <span
                  key={h}
                  className="esim-bar w-[3px] rounded-sm bg-[#0d1715]"
                  style={{ height: h, animationDelay: `${i * 0.25}s` }}
                />
              ))}
              <span className="ms-1 rounded bg-[#0fb3ac] px-1 text-[9px] leading-[14px] text-white">4G</span>
            </span>
          </div>
          <div className="px-5 pt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a847e]">HelloUZ eSIM</p>
            <p className="mt-1 text-xl font-bold text-[#0d1715]">Uzbekistan</p>
            <div className="mt-5 rounded-3xl bg-white p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]">
              <div className="mx-auto aspect-square w-full max-w-[150px]">
                <ПсевдоQR />
              </div>
              <p className="mt-3 text-center text-[11px] text-[#587470]">Scan → Add eSIM</p>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#0fb3ac] px-4 py-3 text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-sm">✓</span>
              <div className="text-[12px] leading-tight">
                <p className="font-bold">Connected</p>
                <p className="text-white/80">Uzbekistan · 4G</p>
              </div>
            </div>
          </div>
          {/* «Чёлка» */}
          <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-[#050a09]" />
        </div>
      </div>
      {/* Плавающие плашки */}
      <div className="glass absolute -left-10 top-24 rounded-2xl px-3 py-2 text-xs font-semibold text-white sm:-left-16">
        ✈️ → 📶
      </div>
      <div
        className="glass absolute -right-8 bottom-28 rounded-2xl px-3 py-2 text-xs font-semibold text-white sm:-right-14"
        style={{ animationDelay: "-2s" }}
      >
        Payme · Click
      </div>
    </div>
  );
}

export default function EsimSection() {
  const { t } = useЯзык();
  return (
    <section id="esim" className="paper-grain px-3 py-20 sm:px-6 sm:py-28">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] px-6 py-14 text-white sm:px-12 sm:py-20"
        style={{ background: "linear-gradient(135deg, #062a27 0%, #07685f 55%, #0a8f88 100%)" }}
      >
        {/* Волны сигнала за телефоном */}
        <div className="pointer-events-none absolute right-[8%] top-1/2 hidden -translate-y-1/2 lg:block" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="esim-wave absolute left-1/2 top-1/2 h-[420px] w-[420px] rounded-full border border-white/20"
              style={{ animationDelay: `${i * 1.2}s` }}
            />
          ))}
        </div>

        <div className="relative grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Reveal>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gold)]">
                {t("esim_kicker")}
              </p>
              <h2 className="serif mb-6 text-[clamp(2.2rem,4.4vw,3.8rem)] font-semibold leading-[1.04]">
                {t("esim_title")}
              </h2>
              <p className="mb-10 max-w-xl text-[16px] leading-relaxed text-white/80">{t("esim_text")}</p>
            </Reveal>

            <div className="mb-10 grid gap-3 sm:grid-cols-3">
              {ШАГИ.map(([з, т], n) => (
                <Reveal key={з} delay={n * 0.1}>
                  <div className="glass h-full rounded-2xl p-4">
                    <p className="condensed mb-2 text-3xl font-bold text-[var(--gold)]">0{n + 1}</p>
                    <p className="mb-1 font-semibold">{t(з)}</p>
                    <p className="text-[13px] leading-snug text-white/75">{t(т)}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <ul className="mb-10 grid gap-2.5 sm:grid-cols-2">
                {ПЛЮСЫ.map((к) => (
                  <li key={к} className="flex items-start gap-2.5 text-[14px] text-white/90">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--gold)] text-[11px] font-bold text-[#1c1606]">
                      ✓
                    </span>
                    {t(к)}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-5">
                <Магнит>
                  <a
                    href={`${APP_URL}/?esim=new`}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-semibold transition-transform hover:scale-[1.03]"
                    style={{ background: "var(--gold)", color: "#1c1606" }}
                  >
                    📶 {t("esim_cta")}
                    <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180">→</span>
                  </a>
                </Магнит>
                <p className="max-w-xs text-xs leading-relaxed text-white/65">{t("esim_note")}</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <Телефон />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
