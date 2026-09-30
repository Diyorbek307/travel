"use client";

import { useEffect, useState } from "react";
import { APP_URL, useЯзык, type Ключ } from "@/lib/i18n";
import Reveal from "./reveal";

/**
 * «Пять вкладок — вся поездка»: экскурсия по настоящим экранам HelloUZ.
 * Скриншоты сняты с работающего приложения (public/app/tabs, ru и en),
 * тексты — ровно про то, что на этих экранах. Вкладки листаются сами,
 * пока человек не нажмёт на одну из них.
 */
const ВКЛАДКИ = ["home", "map", "explore", "audio", "profile"] as const;
type Вкладка = (typeof ВКЛАДКИ)[number];
const ЗНАК: Record<Вкладка, string> = { home: "🏠", map: "🗺️", explore: "✦", audio: "🎧", profile: "👤" };

export default function TourSection() {
  const { t, язык } = useЯзык();
  const [активна, setАктивна] = useState<Вкладка>("explore");
  const [сам, setСам] = useState(true);

  useEffect(() => {
    if (!сам) return;
    const id = setInterval(
      () => setАктивна((в) => ВКЛАДКИ[(ВКЛАДКИ.indexOf(в) + 1) % ВКЛАДКИ.length]),
      5200,
    );
    return () => clearInterval(id);
  }, [сам]);

  const к = (х: string) => `tab_${активна}_${х}` as Ключ;
  const скрин = (в: Вкладка) => `/app/tabs/${язык === "ru" ? "ru" : "en"}-${в}.jpg`;

  return (
    <section id="demo" className="relative overflow-clip px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--cream)" }}>
      <div className="aurora -left-40 top-20 h-[420px] w-[420px]" style={{ background: "rgba(15,179,172,0.28)" }} />
      <div className="relative mx-auto max-w-7xl">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {t("tour_kicker")}
          </p>
          <h2 className="serif mb-5 text-[clamp(2.3rem,4.6vw,4rem)] font-semibold leading-[1.02]">{t("tour_title")}</h2>
          <p className="text-[16px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {t("tour_text")}
          </p>
        </Reveal>

        {/* Переключатель вкладок — как нижнее меню приложения */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-wrap justify-center gap-2">
          {ВКЛАДКИ.map((в) => (
            <button
              key={в}
              onClick={() => {
                setСам(false);
                setАктивна(в);
              }}
              className="relative overflow-hidden rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300"
              style={
                в === активна
                  ? { background: "var(--accent-ink)", color: "#fff", boxShadow: "0 12px 26px -12px rgba(7,104,95,0.7)" }
                  : { background: "rgba(255,255,255,0.8)", color: "var(--ink)", border: "1px solid var(--line)" }
              }
            >
              <span className="me-1.5">{ЗНАК[в]}</span>
              {t(`tab_${в}_n` as Ключ)}
              {/* Полоска времени до автосмены */}
              {в === активна && сам && (
                <span
                  key={активна}
                  className="absolute bottom-0 left-0 h-[3px] bg-[var(--gold)]"
                  style={{ animation: "grow 5.2s linear forwards", width: 0 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-[1fr_auto_1fr]">
          {/* Описание */}
          <div key={активна} className="fade-up order-2 lg:order-1">
            <p className="hand mb-2 text-3xl" style={{ color: "var(--accent-ink)" }}>
              {ЗНАК[активна]} {t(`tab_${активна}_n` as Ключ)}
            </p>
            <h3 className="serif mb-6 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-tight">{t(к("t"))}</h3>
            <ul className="space-y-3.5">
              {(["1", "2", "3"] as const).map((н) => (
                <li key={н} className="flex items-start gap-3 text-[16px] leading-snug">
                  <span
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    ✓
                  </span>
                  {t(к(н))}
                </li>
              ))}
            </ul>
            <a
              href={`${APP_URL}/?tab=${активна}`}
              target="_blank"
              rel="noreferrer"
              className="group mt-9 inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              style={{ background: "var(--accent-ink)" }}
            >
              {t("open_app")}
              <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180">→</span>
            </a>
          </div>

          {/* Телефон с настоящим экраном */}
          <div className="order-1 mx-auto lg:order-2">
            <div
              className="relative w-[270px] rounded-[46px] p-3 sm:w-[300px]"
              style={{ background: "linear-gradient(145deg,#1b2b29,#050a09)", boxShadow: "0 60px 100px -40px rgba(6,42,39,0.65)" }}
            >
              <div className="relative aspect-[390/844] overflow-hidden rounded-[36px] bg-white">
                {ВКЛАДКИ.map((в) => (
                  <img
                    key={в}
                    src={скрин(в)}
                    alt={t(`tab_${в}_n` as Ключ)}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-top transition-all duration-700"
                    style={{
                      opacity: в === активна ? 1 : 0,
                      transform: в === активна ? "scale(1)" : "scale(1.04)",
                    }}
                  />
                ))}
              </div>
              <div className="absolute left-1/2 top-5 h-5 w-24 -translate-x-1/2 rounded-full bg-[#050a09]" />
            </div>
          </div>

          {/* Мини-превью всех экранов — на широком экране справа */}
          <div className="order-3 hidden max-w-[300px] grid-cols-2 gap-3 justify-self-start lg:grid">
            {ВКЛАДКИ.filter((в) => в !== активна).map((в) => (
              <button
                key={в}
                onClick={() => {
                  setСам(false);
                  setАктивна(в);
                }}
                className="group overflow-hidden rounded-2xl border bg-white transition-transform duration-300 hover:-translate-y-1"
                style={{ borderColor: "var(--line)" }}
              >
                <img src={скрин(в)} alt="" loading="lazy" className="aspect-[390/560] w-full object-cover object-top" />
                <p className="px-2 py-1.5 text-center text-[11px] font-semibold">{t(`tab_${в}_n` as Ключ)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
