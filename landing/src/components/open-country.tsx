"use client";

import { useEffect, useRef, useState } from "react";
import { useЯзык, type Ключ } from "@/lib/i18n";
import Reveal from "./reveal";
import { Счёт } from "./effects";

/**
 * «Новый Узбекистан открыт миру»: чем государство открыло страну гостям.
 *
 * Раздел называет имя Президента, поэтому здесь особенно нельзя
 * ошибаться: каждая дата и цифра — с источником (список внизу раздела,
 * те же цифры, что в разделе «Туризм Узбекистана» приложения). Похвала —
 * своими словами и от первого лица сервиса, без «одобрено государством»
 * и без гербов: мы благодарим, а не говорим от имени государства.
 *
 * Указ 2 декабря 2016 года подписан ещё исполняющим обязанности
 * Президента (выборы были 4 декабря) — поэтому в хронике «подписанный
 * Шавкатом Мирзиёевым», без должности.
 */

const ПОРТАЛ_ВИЗ = "https://e-visa.gov.uz/";

const ГОДЫ: { год: number; з: Ключ; т: Ключ }[] = [
  { год: 2016, з: "tl_2016_t", т: "tl_2016_s" },
  { год: 2018, з: "tl_2018_t", т: "tl_2018_s" },
  { год: 2019, з: "tl_2019_t", т: "tl_2019_s" },
  { год: 2022, з: "tl_2022_t", т: "tl_2022_s" },
  { год: 2023, з: "tl_2023_t", т: "tl_2023_s" },
  { год: 2024, з: "tl_2024_t", т: "tl_2024_s" },
  { год: 2025, з: "tl_2025_t", т: "tl_2025_s" },
];

const ИСТОЧНИКИ = [
  { текст: "lex.uz — Decree UP-4861 of 2 December 2016", ссылка: "https://lex.uz/docs/3077023" },
  {
    текст: "Permanent Mission of Uzbekistan to the UN — e-visa for 51 countries (2018)",
    ссылка:
      "https://www.un.int/uzbekistan/news/republic-uzbekistan-introduces-e-visa-system-51-countries-and-5-day-transit-visa-free-procedure",
  },
  {
    текст: "Caspian Policy Center — visa-free regime for 45 more countries (2019)",
    ссылка: "https://www.caspianpolicy.org/research/articles/uzbekistan-introduces-visa-free-regime-for-45-more-countries",
  },
  {
    текст: "UN Tourism — 25th session of the General Assembly, Samarkand (2023)",
    ссылка: "https://www.untourism.int/event/general-assembly-twenty-fifth-session",
  },
  {
    текст: "Statistics Agency via Kun.uz — tourists in 2024",
    ссылка:
      "https://kun.uz/ru/news/2025/02/03/obyavleno-kolichestvo-turistov-posetivshix-uzbekistan-v-2024-godu",
  },
  {
    текст: "UNESCO — 43rd General Conference opens in Samarkand (2025)",
    ссылка: "https://www.unesco.org/en/articles/unesco-43rd-general-conference-opens-samarkand-uzbekistan",
  },
  {
    текст: "The Diplomat — visa-free entry for 90 countries (2025)",
    ссылка:
      "https://thediplomat.com/2025/05/uzbekistan-seeks-to-increase-tourist-flows-floats-possibility-of-visa-free-regime-for-us-citizens/",
  },
  { текст: "e-visa.gov.uz — official e-visa portal", ссылка: ПОРТАЛ_ВИЗ },
];

/** Флаг Узбекистана (как в приложении): 2:1, полумесяц и 12 звёзд. */
function Флаг() {
  const звезда = (x: number, y: number) => {
    const точки = Array.from({ length: 10 }, (_, i) => {
      const угол = -Math.PI / 2 + (i * Math.PI) / 5;
      const д = i % 2 === 0 ? 1.5 : 0.6;
      return `${(x + д * Math.cos(угол)).toFixed(2)},${(y + д * Math.sin(угол)).toFixed(2)}`;
    });
    return <polygon key={`${x}-${y}`} points={точки.join(" ")} fill="#fff" />;
  };
  const ряды = [
    { y: 4, x: [30.2, 34.8, 39.4] },
    { y: 8.3, x: [25.6, 30.2, 34.8, 39.4] },
    { y: 12.6, x: [21, 25.6, 30.2, 34.8, 39.4] },
  ];
  return (
    <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="block h-full w-full" aria-hidden>
      <rect width="100" height="50" fill="#fff" />
      <rect width="100" height="16.2" fill="#0099B5" />
      <rect y="34" width="100" height="16" fill="#1EB53A" />
      <rect y="16" width="100" height="1" fill="#CE1126" />
      <rect y="33" width="100" height="1" fill="#CE1126" />
      <circle cx="12" cy="8.3" r="5.6" fill="#fff" />
      <circle cx="14" cy="8.3" r="4.7" fill="#0099B5" />
      {ряды.flatMap((р) => р.x.map((x) => звезда(x, р.y)))}
    </svg>
  );
}

/**
 * Флаг на ветру: режем его на вертикальные полоски, и каждая качается
 * со своим сдвигом фазы — получается волна без WebGL.
 */
function ФлагНаВетру() {
  const N = 28;
  return (
    <div className="relative aspect-[2/1] w-full" style={{ filter: "drop-shadow(0 24px 30px rgba(6,42,39,0.25))" }}>
      {Array.from({ length: N }, (_, i) => (
        <div
          key={i}
          className="flag-slice absolute top-0 h-full overflow-hidden"
          style={{
            left: `${(i * 100) / N}%`,
            width: `${100 / N + 0.2}%`,
            animationDelay: `${-i * 0.09}s`,
            ["--amp" as string]: `${4 + (i / N) * 10}px`,
          }}
        >
          <div className="absolute top-0 h-full" style={{ width: `${N * 100}%`, left: `${-i * 100}%` }}>
            <Флаг />
            {/* Складки едут вместе с полоской, иначе над волной видны пятна */}
            <div
              className="absolute inset-0 mix-blend-soft-light"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 6%, rgba(0,0,0,0.18) 12%, rgba(255,255,255,0.35) 18%)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Восьмиконечная звезда-гирих — орнамент медресе. */
function Гирих({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="0.8">
      {[0, 45].map((у) => (
        <rect key={у} x="40" y="40" width="120" height="120" transform={`rotate(${у} 100 100)`} />
      ))}
      {[0, 45].map((у) => (
        <rect key={у} x="62" y="62" width="76" height="76" transform={`rotate(${у + 22.5} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="28" />
      <circle cx="100" cy="100" r="92" strokeDasharray="2 5" />
    </svg>
  );
}

/**
 * Хроника: на широком экране карточки едут вбок, пока человек листает
 * вниз (секция «прилипает»); на телефоне — обычный столбик.
 */
function Хроника() {
  const { t, язык } = useЯзык();
  const обёртка = useRef<HTMLDivElement>(null);
  const лента = useRef<HTMLDivElement>(null);
  const [п, setП] = useState(0);
  const [ход, setХод] = useState(0);

  useEffect(() => {
    let кадр = 0;
    const мерить = () => {
      const л = лента.current;
      if (л) setХод(Math.max(0, л.scrollWidth - window.innerWidth));
    };
    const при = () => {
      cancelAnimationFrame(кадр);
      кадр = requestAnimationFrame(() => {
        const el = обёртка.current;
        if (!el || el.offsetHeight === 0) return;
        const r = el.getBoundingClientRect();
        setП(Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight))));
      });
    };
    мерить();
    при();
    window.addEventListener("scroll", при, { passive: true });
    window.addEventListener("resize", мерить);
    return () => {
      window.removeEventListener("scroll", при);
      window.removeEventListener("resize", мерить);
      cancelAnimationFrame(кадр);
    };
  }, [язык]);

  const справаНалево = язык === "ar";
  const активный = Math.round(п * (ГОДЫ.length - 1));

  const Карточка = ({ n, широкая }: { n: number; широкая?: boolean }) => {
    const г = ГОДЫ[n];
    const горит = широкая ? n === активный : true;
    return (
      <article
        className={`relative flex flex-col overflow-hidden rounded-[28px] border p-7 transition-all duration-500 ${
          широкая ? "h-[400px] w-[360px] flex-shrink-0" : ""
        }`}
        style={{
          borderColor: горит && широкая ? "transparent" : "var(--line)",
          background:
            горит && широкая
              ? "linear-gradient(150deg, var(--accent-deep), #0a8f88 60%, var(--accent))"
              : "rgba(255,255,255,0.75)",
          color: горит && широкая ? "#fff" : "var(--ink)",
          transform: широкая ? `scale(${горит ? 1 : 0.94})` : undefined,
          boxShadow: горит && широкая ? "0 30px 60px -30px rgba(7,104,95,0.7)" : "none",
        }}
      >
        <Гирих
          className={`pointer-events-none absolute -bottom-16 -right-16 w-56 ${
            горит && широкая ? "spin-slower text-white/40" : "text-[var(--accent)] opacity-25"
          }`}
        />
        <p
          className={`serif text-7xl font-semibold leading-none tabular-nums ${
            горит && широкая ? "" : "text-shimmer"
          }`}
          style={горит && широкая ? { color: "var(--gold)" } : undefined}
        >
          {г.год}
        </p>
        <h3 className="serif mt-6 text-2xl font-semibold leading-tight">{t(г.з)}</h3>
        <p
          className="mt-3 text-[14px] leading-relaxed"
          style={{ color: горит && широкая ? "rgba(255,255,255,0.85)" : "var(--ink-soft)" }}
        >
          {t(г.т)}
        </p>
      </article>
    );
  };

  return (
    <>
      <div ref={обёртка} className="relative hidden lg:block" style={{ height: `${120 + ГОДЫ.length * 32}vh` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="mx-auto mb-10 flex w-full max-w-7xl items-end justify-between px-8">
            <p className="hand text-4xl" style={{ color: "var(--accent-ink)" }}>
              {t("open_tl_kicker")}
            </p>
            <p className="condensed text-6xl font-bold tabular-nums" style={{ color: "var(--sand)" }}>
              {ГОДЫ[активный].год}
            </p>
          </div>
          <div
            ref={лента}
            className="flex w-max items-center gap-6 px-[8vw] will-change-transform"
            style={{ transform: `translateX(${(справаНалево ? 1 : -1) * п * ход}px)` }}
          >
            {ГОДЫ.map((г, n) => (
              <Карточка key={г.год} n={n} широкая />
            ))}
          </div>
          {/* Шкала лет */}
          <div className="mx-auto mt-10 w-full max-w-5xl px-8">
            <div className="relative h-[2px] rounded-full" style={{ background: "var(--line)" }}>
              <div
                className="absolute inset-y-0 rounded-full ltr:left-0 rtl:right-0"
                style={{ width: `${п * 100}%`, background: "linear-gradient(90deg,var(--accent),var(--gold))" }}
              />
              {ГОДЫ.map((г, n) => (
                <span
                  key={г.год}
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 rtl:translate-x-1/2 transition-colors duration-300"
                  style={{
                    [справаНалево ? "right" : "left"]: `${(n / (ГОДЫ.length - 1)) * 100}%`,
                    background: n <= активный ? "var(--accent)" : "var(--paper)",
                    borderColor: n <= активный ? "var(--accent)" : "var(--line)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5 lg:hidden">
        <p className="hand mb-6 text-3xl" style={{ color: "var(--accent-ink)" }}>
          {t("open_tl_kicker")}
        </p>
        <div className="relative space-y-4 border-s-2 ps-5" style={{ borderColor: "var(--sand)" }}>
          {ГОДЫ.map((г, n) => (
            <Reveal key={г.год}>
              <span
                className="absolute -start-[7px] mt-8 h-3 w-3 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              <Карточка n={n} />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

export default function OpenCountry() {
  const { t } = useЯзык();
  const цифры: { до: number; знаков?: number; до_знак?: string; после?: string; подпись: Ключ }[] = [
    { до: 90, до_знак: "≈", подпись: "open_n1" },
    { до: 2, подпись: "open_n2" },
    { до: 8.2, знаков: 1, подпись: "open_n3" },
    { до: 2, до_знак: "×", подпись: "open_n4" },
  ];

  return (
    <section id="open" className="paper-grain relative overflow-clip pt-24 sm:pt-32">
      <div
        className="aurora -left-40 top-10 h-[420px] w-[420px]"
        style={{ background: "rgba(15,179,172,0.35)" }}
      />
      <div
        className="aurora -right-32 top-[30%] h-[380px] w-[380px]"
        style={{ background: "rgba(233,196,106,0.45)", animationDelay: "-6s" }}
      />
      <Гирих className="spin-slower pointer-events-none absolute -right-40 -top-40 w-[520px] text-[var(--accent)] opacity-[0.12]" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <p
            className="mb-5 text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: "var(--accent-ink)" }}
          >
            {t("open_kicker")}
          </p>
          <h2 className="serif mb-7 text-[clamp(2.4rem,5vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.02em]">
            {t("open_title_1")}
            <br />
            <span className="text-shimmer italic">{t("open_title_2")}</span>
          </h2>
          <p className="mb-6 max-w-xl text-[17px] leading-relaxed">{t("open_lead")}</p>
          <p
            className="mb-8 max-w-xl border-s-4 ps-5 text-[16px] leading-relaxed"
            style={{ borderColor: "var(--gold)", color: "var(--ink-soft)" }}
          >
            {t("open_praise")}
          </p>
          <p className="serif max-w-xl text-xl italic leading-snug" style={{ color: "var(--accent-deep)" }}>
            «{t("open_thanks")}»
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mx-auto w-full max-w-[520px]">
            <div className="float">
              <ФлагНаВетру />
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3">
              {цифры.map((ц) => (
                <div
                  key={ц.подпись}
                  className="rounded-3xl border p-5 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                  style={{ borderColor: "var(--line)", background: "rgba(255,255,255,0.7)" }}
                >
                  <p
                    className="serif text-5xl font-semibold leading-none tabular-nums"
                    style={{ color: "var(--accent-ink)" }}
                  >
                    {ц.до_знак}
                    <Счёт до={ц.до} знаков={ц.знаков} />
                  </p>
                  <p className="mt-2 text-[12px] leading-snug" style={{ color: "var(--ink-soft)" }}>
                    {t(ц.подпись)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mt-20 lg:mt-10">
        <Хроника />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 lg:pt-0">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <a
              href={ПОРТАЛ_ВИЗ}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-semibold transition-transform hover:scale-[1.03]"
              style={{ background: "var(--gold)", color: "#1c1606" }}
            >
              {t("open_evisa_btn")} ↗
            </a>
            <p className="mt-3 text-xs" style={{ color: "var(--ink-soft)" }}>
              {t("open_evisa_note")}
            </p>
          </div>
          <details className="max-w-xl text-xs" style={{ color: "var(--ink-soft)" }}>
            <summary className="cursor-pointer font-semibold uppercase tracking-[0.18em]">
              {t("open_sources")} ({ИСТОЧНИКИ.length})
            </summary>
            <ul className="mt-3 space-y-1.5">
              {ИСТОЧНИКИ.map((и) => (
                <li key={и.ссылка}>
                  <a href={и.ссылка} target="_blank" rel="noreferrer" className="underline underline-offset-2" dir="ltr">
                    {и.текст}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </section>
  );
}
