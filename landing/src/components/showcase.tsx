"use client";

import { useEffect, useState } from "react";
import { APP_URL, useЯзык } from "@/lib/i18n";
import Reveal from "./reveal";

/**
 * Приложение в стеклянной рамке на закатном Самарканде. В центре —
 * телефон с настоящими снимками экрана HelloUZ (сняты с живого сайта,
 * лежат в public/app), по бокам — стеклянные панели, как в интерфейсе.
 */

const фото = (id: string, w = 400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

const МЕСТА = [
  { имя: "Registan", где: "Samarkand", img: фото("1664602078796-68ee76b3fc59") },
  { имя: "Shah-i-Zinda", где: "Samarkand", img: фото("1728029062560-4b0e2b958885") },
  { имя: "Ark Fortress", где: "Bukhara", img: фото("1653023102302-247f5f0fbdd1") },
  { имя: "Itchan Kala", где: "Khiva", img: фото("1654861857666-1e8c438cbe4a") },
];

const СНИМКОВ = 4;

export default function Showcase() {
  const { t, язык } = useЯзык();
  const [кадр, setКадр] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setКадр((k) => (k + 1) % СНИМКОВ), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="demo" className="relative overflow-hidden py-24 sm:py-32" style={{ background: "#2a1a12" }}>
      <img
        src={фото("1664602078796-68ee76b3fc59", 1920)}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-[2px]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(42,26,18,0.55), rgba(42,26,18,0.35) 40%, rgba(20,12,8,0.85))",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="mx-auto mb-14 max-w-2xl text-center text-white">
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: "var(--gold)" }}
            >
              {t("demo_kicker")}
            </p>
            <h2 className="serif mb-5 text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[1.05]">
              {t("demo_title")}
            </h2>
            <p className="text-[15px] leading-relaxed text-white/75">{t("demo_text")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass relative mx-auto grid max-w-6xl items-center gap-6 rounded-[36px] p-5 sm:p-8 lg:grid-cols-[1fr_auto_1fr]">
            {/* Левая панель — город */}
            <div className="hidden overflow-hidden rounded-[26px] lg:block">
              <div className="relative h-[520px]">
                <img
                  src={фото("1728029062560-4b0e2b958885", 800)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(20,12,8,0.85), transparent 50%)" }}
                />
                <div className="absolute left-6 top-6 text-white">
                  <p className="serif text-5xl font-semibold">Samarkand</p>
                  <p className="mt-1 text-lg">Uzbekistan 🇺🇿</p>
                </div>
                <div className="glass absolute bottom-5 left-5 right-5 rounded-2xl p-4 text-white">
                  <p className="text-sm font-semibold">✨ {t("card1_t")}</p>
                  <p className="mt-1 text-[13px] leading-snug text-white/85">{t("demo_chat")}</p>
                </div>
              </div>
            </div>

            {/* Телефон */}
            <div className="relative mx-auto">
              <div
                className="relative h-[600px] w-[290px] overflow-hidden rounded-[46px] border-[10px] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]"
                style={{ borderColor: "#111", background: "#111" }}
              >
                {Array.from({ length: СНИМКОВ }, (_, n) => (
                  <img
                    key={n}
                    src={`/app/${язык === "ru" ? "ru" : "en"}-${n + 1}.jpg`}
                    alt={`HelloUZ screen ${n + 1}`}
                    className="absolute inset-0 h-full w-full object-cover object-top transition-all duration-700"
                    style={{
                      opacity: n === кадр ? 1 : 0,
                      transform: n === кадр ? "scale(1)" : "scale(1.04)",
                    }}
                  />
                ))}
                <span className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
              </div>
              <div className="mt-5 flex justify-center gap-2">
                {Array.from({ length: СНИМКОВ }, (_, n) => (
                  <button
                    key={n}
                    aria-label={`${n + 1}`}
                    onClick={() => setКадр(n)}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: n === кадр ? 26 : 8,
                      background: n === кадр ? "var(--gold)" : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Правая панель — места */}
            <div className="text-white">
              <p className="mb-4 text-lg font-semibold">{t("demo_must")}</p>
              <div className="space-y-3">
                {МЕСТА.map((м) => (
                  <div
                    key={м.имя}
                    className="glass flex items-center gap-4 rounded-2xl p-2.5 transition-transform hover:translate-x-1"
                  >
                    <img src={м.img} alt="" className="h-16 w-20 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{м.имя}</p>
                      <p className="text-xs text-white/70">📍 {м.где}</p>
                    </div>
                    <span className="mr-2 text-white/70">♡</span>
                  </div>
                ))}
              </div>
              <a
                href={APP_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.03]"
                style={{ background: "var(--gold)", color: "var(--ink)" }}
              >
                {t("open_app")} ↗
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
