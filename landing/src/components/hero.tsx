"use client";

import { useRef } from "react";
import Logo from "./logo";
import { APP_URL, useЯзык } from "@/lib/i18n";
import { Гранат, Купол, Минарет, Портал, Птицы } from "./sketches";
import { Магнит, Счёт } from "./effects";

export interface Цифры {
  cities: number;
  places: number;
  venues: number;
}

const РЕГИСТАН =
  "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=1100&q=80&auto=format&fit=crop";

/**
 * Первый экран — «билет» Silk Road Pass, как у лучших туристических
 * лендингов: слева крупная антиква и призыв, справа объёмный билет с
 * Регистаном в окне. Билет поворачивается за курсором, фото внутри
 * смещается глубже — получается слой за слоем. Вокруг — наброски
 * памятников, которые рисуются сами.
 */
export default function Hero({ цифры }: { цифры: Цифры }) {
  const { t } = useЯзык();
  const сцена = useRef<HTMLDivElement>(null);
  const билет = useRef<HTMLDivElement>(null);
  const фото = useRef<HTMLDivElement>(null);

  const двигать = (e: React.PointerEvent) => {
    const с = сцена.current?.getBoundingClientRect();
    if (!с || !билет.current || !фото.current) return;
    const x = (e.clientX - с.left) / с.width - 0.5;
    const y = (e.clientY - с.top) / с.height - 0.5;
    билет.current.style.transform = `rotateY(${x * 14 - 8}deg) rotateX(${-y * 10 + 4}deg)`;
    фото.current.style.transform = `translate3d(${x * -18}px, ${y * -14}px, 0) scale(1.1)`;
  };
  const сброс = () => {
    if (билет.current) билет.current.style.transform = "";
    if (фото.current) фото.current.style.transform = "";
  };

  const доверие = [
    ["✦", t("trust_free"), t("trust_free_sub")],
    ["文", t("trust_langs"), t("trust_langs_sub")],
    ["⤓", t("trust_offline"), t("trust_offline_sub")],
    ["✧", t("trust_ai"), t("trust_ai_sub")],
  ];

  return (
    <section id="top" className="paper-grain relative overflow-hidden pt-28 sm:pt-32">
      {/* Наброски по краям — как на полях путевого блокнота */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ color: "rgba(34,26,19,0.55)" }}
      >
        <Птицы className="absolute left-[30%] top-[16%] w-16" />
        <Гранат className="absolute bottom-[14%] left-[3%] w-14" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[1.08fr_1fr] lg:items-center lg:pb-24">
        <div>
          <p
            className="fade-up mb-7 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ borderColor: "var(--line)", color: "var(--brick)", background: "rgba(255,255,255,0.5)" }}
          >
            <span>📍</span> {t("hero_kicker")}
          </p>
          <h1 className="serif mb-7 text-[clamp(2.5rem,4.3vw,4.3rem)] font-semibold leading-[1.02] tracking-[-0.02em]">
            <span className="line-mask">
              <span style={{ ["--delay" as string]: "0.1s" }}>{t("hero_title_1")}</span>
            </span>
            <span className="line-mask">
              <span style={{ ["--delay" as string]: "0.22s" }}>{t("hero_title_2")}</span>
            </span>
            <span className="line-mask">
              <span style={{ ["--delay" as string]: "0.34s", color: "var(--brick)" }}>
                <em className="not-italic">{t("hero_title_3")}</em>
              </span>
            </span>
          </h1>
          <p
            className="fade-up mb-9 max-w-lg text-[17px] leading-relaxed"
            style={{ color: "var(--ink-soft)", ["--delay" as string]: "0.5s" }}
          >
            {t("hero_sub")}
          </p>
          <div
            className="fade-up mb-12 flex flex-wrap items-center gap-4"
            style={{ ["--delay" as string]: "0.62s" }}
          >
            <Магнит>
              <a
                href={APP_URL}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(154,59,34,0.7)] transition-transform hover:scale-[1.03]"
                style={{ background: "var(--brick)" }}
              >
                {t("hero_cta")}
                <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180">→</span>
              </a>
            </Магнит>
            <a href="#demo" className="group inline-flex items-center gap-3 text-[15px] font-semibold">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full border transition-colors group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)]"
                style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.6)" }}
              >
                ▶
              </span>
              {t("hero_watch")}
            </a>
          </div>
          <div
            className="fade-up grid grid-cols-2 gap-3 sm:grid-cols-4"
            style={{ ["--delay" as string]: "0.75s" }}
          >
            {доверие.map(([знак, заголовок, под]) => (
              <div
                key={заголовок}
                className="rounded-2xl border p-3.5 transition-transform hover:-translate-y-1"
                style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.55)" }}
              >
                <p className="mb-2 text-lg" style={{ color: "var(--brick)" }}>
                  {знак}
                </p>
                <p className="text-[13px] font-semibold">{заголовок}</p>
                <p className="text-[11px] leading-snug" style={{ color: "var(--ink-soft)" }}>
                  {под}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Билет */}
        <div
          ref={сцена}
          onPointerMove={двигать}
          onPointerLeave={сброс}
          className="relative mx-auto mb-10 aspect-[5/4] w-full max-w-[700px] lg:mb-0"
          style={{ perspective: "1400px" }}
        >
          <div
            className="pointer-events-none absolute -left-10 -top-12 z-0 w-24"
            style={{ color: "rgba(34,26,19,0.6)" }}
          >
            <Минарет className="w-full" />
            <p className="hand -mt-2 text-center text-xl" style={{ color: "var(--ink-soft)" }}>
              Kalon
            </p>
          </div>
          <div
            className="pointer-events-none absolute -right-4 -top-24 z-0 w-40"
            style={{ color: "rgba(34,26,19,0.6)" }}
          >
            <Купол className="w-full" />
            <p className="hand -mt-1 text-center text-xl" style={{ color: "var(--ink-soft)" }}>
              Gur-e-Amir
            </p>
          </div>
          <div
            className="pointer-events-none absolute -bottom-12 -right-10 z-0 w-36"
            style={{ color: "rgba(34,26,19,0.55)" }}
          >
            <Портал className="w-full" />
            <p className="hand -mt-1 text-center text-xl" style={{ color: "var(--ink-soft)" }}>
              Registan
            </p>
          </div>

          <div
            ref={билет}
            className="float absolute inset-x-[6%] inset-y-[10%] transition-transform duration-300 ease-out"
            style={{ transformStyle: "preserve-3d", transform: "rotateY(-8deg) rotateX(4deg)" }}
          >
            <div
              className="shine-sweep absolute inset-0 flex overflow-hidden rounded-[28px] shadow-[0_40px_80px_-30px_rgba(34,26,19,0.55)]"
              style={{ background: "linear-gradient(135deg,#fffaf2,#f1e4cf)" }}
            >
              {/* Корешок билета */}
              <div
                className="relative flex w-[38%] flex-col justify-between border-r-2 border-dashed p-3 sm:w-[34%] sm:p-5"
                style={{ borderColor: "rgba(34,26,19,0.2)" }}
              >
                <div>
                  <Logo size={34} />
                  <p
                    className="serif mt-2 text-sm font-bold leading-tight sm:mt-3 sm:text-xl"
                    style={{ color: "var(--brick)" }}
                  >
                    {t("pass_title")}
                  </p>
                  <p
                    className="mt-1 hidden text-[10px] leading-snug sm:block"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {t("pass_sub")}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.18em]" style={{ color: "var(--ink-soft)" }}>
                    {t("pass_valid")}
                  </p>
                  {/* Штрихкод */}
                  <div className="mt-2 flex h-10 items-stretch gap-[2px]">
                    {Array.from({ length: 30 }, (_, i) => (
                      <span
                        key={i}
                        style={{ width: [1, 2, 1, 3, 1, 2][i % 6], background: "var(--ink)", opacity: 0.85 }}
                      />
                    ))}
                  </div>
                  <p
                    className="mt-1 font-mono text-[9px] tracking-widest"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    HZ 2026 · UZB · 10 LANG
                  </p>
                </div>
                {/* Вырезы, как у настоящего билета */}
                <span
                  className="absolute -right-3 -top-3 h-6 w-6 rounded-full"
                  style={{ background: "var(--paper)" }}
                />
                <span
                  className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full"
                  style={{ background: "var(--paper)" }}
                />
              </div>
              {/* Окно с Регистаном */}
              <div className="relative flex-1 overflow-hidden">
                <div
                  ref={фото}
                  className="absolute inset-[-6%] transition-transform duration-300 ease-out"
                  style={{ transform: "scale(1.1)" }}
                >
                  <img src={РЕГИСТАН} alt="Registan, Samarkand" className="h-full w-full object-cover" />
                </div>
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(20,12,6,0.55), transparent 55%)" }}
                />
                <p className="serif absolute bottom-4 left-5 text-2xl font-semibold text-white">Samarkand</p>
              </div>
            </div>
          </div>

          {/* Дети-проводники из приложения */}
          <div className="absolute -bottom-12 left-0 z-30 flex items-center gap-2 sm:-left-8 sm:bottom-[2%]">
            <video
              src={`${APP_URL}/videos/kids-hello.mp4`}
              poster={`${APP_URL}/videos/kids-hello.webp`}
              autoPlay
              muted
              loop
              playsInline
              className="h-20 w-20 rounded-full border-4 object-cover shadow-xl sm:h-24 sm:w-24"
              style={{ borderColor: "var(--paper)", objectPosition: "center 40%" }}
            />
            <span
              className="hand rounded-2xl rounded-bl-none px-3 py-1.5 text-lg shadow-lg"
              style={{ background: "var(--paper)" }}
            >
              {t("kids_hello")}
            </span>
          </div>
        </div>
      </div>

      {/* Живые цифры из приложения */}
      <div className="relative mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <div
          className="grid grid-cols-2 gap-y-5 rounded-3xl border px-6 py-5 sm:grid-cols-4"
          style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.55)" }}
        >
          {[
            [цифры.cities, t("stat_cities")],
            [цифры.places, t("stat_places")],
            [цифры.venues, t("stat_venues")],
            [10, t("stat_langs")],
          ].map(([число, подпись]) => (
            <div key={String(подпись)} className="text-center">
              <p className="serif text-4xl font-semibold tabular-nums" style={{ color: "var(--tile)" }}>
                <Счёт до={Number(число)} />
              </p>
              <p
                className="text-xs font-medium uppercase tracking-[0.14em]"
                style={{ color: "var(--ink-soft)" }}
              >
                {подпись}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
