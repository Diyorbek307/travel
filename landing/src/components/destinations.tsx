"use client";

import { useEffect, useState } from "react";
import { APP_URL, useЯзык, type Язык } from "@/lib/i18n";

/**
 * Города — экран во всю ширину: фото сменяется с медленным наездом,
 * слева огромное название города узким шрифтом, справа карточки других
 * городов. Листается само, стрелками и по карточкам.
 */

const фото = (id: string) => `https://images.unsplash.com/photo-${id}?w=1920&q=80&auto=format&fit=crop`;

interface Город {
  id: string;
  регион: Record<Язык, string>;
  имя: Record<Язык, string>;
  текст: Record<Язык, string>;
  img: string;
  /** Какую часть кадра держать в окне. */
  позиция?: string;
}

const ГОРОДА: Город[] = [
  {
    id: "samarkand",
    регион: { ru: "Самаркандская область", en: "Samarkand region" },
    имя: { ru: "Самарканд", en: "Samarkand" },
    текст: {
      ru: "Регистан, Шахи-Зинда и Гур-Эмир — бирюзовые купола, которым больше шести веков.",
      en: "Registan, Shah-i-Zinda and Gur-e-Amir — turquoise domes more than six centuries old.",
    },
    img: фото("1664602078796-68ee76b3fc59"),
  },
  {
    id: "bukhara",
    регион: { ru: "Бухарская область", en: "Bukhara region" },
    имя: { ru: "Бухара", en: "Bukhara" },
    текст: {
      ru: "Арк, минарет Калян и Ляби-Хауз: старый город, где жизнь идёт вокруг пруда под тутовником.",
      en: "The Ark, Kalon minaret and Lyabi-Hauz: an old town whose life revolves around a pond under mulberries.",
    },
    img: фото("1653023102302-247f5f0fbdd1"),
  },
  {
    id: "khiva",
    регион: { ru: "Хорезм", en: "Khorezm" },
    имя: { ru: "Хива", en: "Khiva" },
    текст: {
      ru: "Ичан-Кала — город внутри стен, живой музей под открытым небом.",
      en: "Itchan Kala — a city within walls, a living open-air museum.",
    },
    img: фото("1654861857666-1e8c438cbe4a"),
  },
  {
    id: "tashkent",
    регион: { ru: "Столица", en: "The capital" },
    имя: { ru: "Ташкент", en: "Tashkent" },
    текст: {
      ru: "Базар Чорсу, Хаст-Имам и метро-музей — столица, с которой начинается поездка.",
      en: "Chorsu bazaar, Hast-Imam and the museum-like metro — the capital where most trips begin.",
    },
    img: фото("1622030797403-fa221ce5d208"),
  },
  {
    id: "mountains",
    регион: { ru: "Горы у Ташкента", en: "Mountains near Tashkent" },
    имя: { ru: "Амирсой", en: "Amirsoy" },
    текст: {
      ru: "Западный Тянь-Шань рядом со столицей: зимой — лыжи, летом — тропы, Чарвак и Чимган.",
      en: "The Western Tien Shan next to the capital: skiing in winter, trails, Charvak and Chimgan in summer.",
    },
    img: фото("1712780943624-b5d3f7a72792"),
    позиция: "center 80%",
  },
];

export default function Destinations() {
  const { t, язык } = useЯзык();
  const [i, setI] = useState(0);
  const [пауза, setПауза] = useState(false);
  const город = ГОРОДА[i];

  useEffect(() => {
    if (пауза) return;
    const id = setTimeout(() => setI((x) => (x + 1) % ГОРОДА.length), 6500);
    return () => clearTimeout(id);
  }, [i, пауза]);

  const другие = [...ГОРОДА.slice(i + 1), ...ГОРОДА.slice(0, i)];

  return (
    <section
      id="cities"
      className="relative h-[100svh] min-h-[640px] overflow-hidden"
      style={{ background: "var(--night)" }}
      onPointerEnter={() => setПауза(true)}
      onPointerLeave={() => setПауза(false)}
    >
      {ГОРОДА.map((г, n) => (
        <div
          key={г.id}
          className="absolute inset-0 transition-opacity duration-[1400ms]"
          style={{ opacity: n === i ? 1 : 0 }}
          aria-hidden={n !== i}
        >
          {n === i && (
            <img src={г.img} alt="" className="kenburns h-full w-full object-cover" style={{ objectPosition: г.позиция }} />
          )}
        </div>
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,14,12,0.78) 0%, rgba(10,14,12,0.35) 50%, rgba(10,14,12,0.2) 100%), linear-gradient(to top, rgba(10,14,12,0.7), transparent 45%)",
        }}
      />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-10 pt-28 text-white sm:px-8 lg:pb-16">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div key={город.id}>
            <p className="fade-up mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/75">
              <span className="h-px w-10 bg-white/60" /> {t("cities_kicker")} · {город.регион[язык]}
            </p>
            <h2 className="line-mask condensed text-[clamp(3.8rem,11vw,9.5rem)] font-bold leading-[0.88]">
              <span style={{ ["--delay" as string]: "0.05s" }}>{город.имя[язык]}</span>
            </h2>
            <p className="fade-up mt-5 max-w-md text-[15px] leading-relaxed text-white/85" style={{ ["--delay" as string]: "0.25s" }}>
              {город.текст[язык]}
            </p>
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="fade-up mt-7 inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.04]"
              style={{ background: "var(--gold)", color: "var(--ink)", ["--delay" as string]: "0.35s" }}
            >
              {t("cities_open")} ↗
            </a>
          </div>

          <div>
            <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0">
              {другие.slice(0, 4).map((г) => (
                <button
                  key={г.id}
                  onClick={() => setI(ГОРОДА.indexOf(г))}
                  className="group relative h-56 w-40 flex-shrink-0 overflow-hidden rounded-2xl text-left shadow-2xl transition-transform duration-500 hover:-translate-y-2 sm:h-64 sm:w-44"
                >
                  <img src={г.img.replace("w=1920", "w=500")} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent 60%)" }} />
                  <span className="absolute bottom-3 left-3 right-3">
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-white/70">{г.регион[язык]}</span>
                    <span className="condensed block text-xl font-bold text-white">{г.имя[язык]}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-7 flex items-center gap-4">
              <button
                aria-label="←"
                onClick={() => setI((i - 1 + ГОРОДА.length) % ГОРОДА.length)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-black"
              >
                ←
              </button>
              <button
                aria-label="→"
                onClick={() => setI((i + 1) % ГОРОДА.length)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-black"
              >
                →
              </button>
              <div className="relative h-px flex-1 bg-white/25">
                <span
                  key={`${i}-${пауза}`}
                  className="absolute inset-y-0 left-0 bg-white"
                  style={
                    пауза
                      ? { width: `${((i + 1) / ГОРОДА.length) * 100}%` }
                      : { width: 0, animation: "grow 6.5s linear forwards" }
                  }
                />
              </div>
              <span className="condensed text-5xl font-bold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
