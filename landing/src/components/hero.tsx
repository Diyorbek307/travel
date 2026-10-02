"use client";

import { useEffect, useRef, useState } from "react";
import { тр, useЯзык, type Многоязычно } from "@/lib/i18n";
import { Счёт } from "./effects";
import StoreButtons from "./store-buttons";
import { Слова, доля, useПрокрутка } from "./cinema";

export interface Цифры {
  cities: number;
  places: number;
  venues: number;
}

/** Бухара: минарет Калян и мечеть Пои-Калян. К минарету камера и «подлетает». */
const БУХАРА =
  "https://images.unsplash.com/photo-1653023102302-247f5f0fbdd1?w=1920&q=78&auto=format&fit=crop";
const БУХАРА_МЯГКО =
  "https://images.unsplash.com/photo-1653023102302-247f5f0fbdd1?w=480&q=45&auto=format&fit=crop";

const ПРО_КАРТУ: Многоязычно = {
  en: "Every city, sight and table on one map, in your language. Pick a city and get a plan for the day.",
  ru: "Все города, места и столики — на одной карте и на вашем языке. Выберите город — и получите план на день.",
  uz: "Barcha shaharlar, joylar va restoranlar — bitta xaritada, oʻz tilingizda. Shaharni tanlang — kunlik reja tayyor.",
  zh: "所有城市、景点和餐厅都在一张地图上，用你的语言呈现。选一座城市，就能得到当天的行程。",
  ko: "모든 도시와 명소, 식당이 한 지도에, 내 언어로. 도시를 고르면 하루 일정이 나와요.",
  de: "Alle Städte, Sehenswürdigkeiten und Tische auf einer Karte, in deiner Sprache. Stadt wählen — Tagesplan erhalten.",
  fr: "Toutes les villes, les sites et les tables sur une seule carte, dans votre langue. Choisissez une ville, obtenez le plan du jour.",
  ja: "すべての街、名所、レストランをひとつの地図に、あなたの言語で。街を選べば1日のプランが手に入ります。",
  tr: "Tüm şehirler, yerler ve masalar tek haritada, kendi dilinizde. Bir şehir seçin, günün planını alın.",
  ar: "كل المدن والمعالم والمطاعم على خريطة واحدة وبلغتك. اختر مدينة واحصل على خطة اليوم.",
};

const ПРО_ОФЛАЙН: Многоязычно = {
  en: "Download your cities before the trip — HelloUZ keeps working in the mountains, on the train and in flight mode, with no signal or roaming.",
  ru: "Скачайте города перед поездкой — и HelloUZ работает в горах, в поезде и в режиме полёта, без связи и роуминга.",
  uz: "Safardan oldin shaharlarni yuklab oling — HelloUZ togʻda, poyezdda va parvoz rejimida aloqasiz va roumingsiz ishlaydi.",
  zh: "出发前下载城市——在山里、火车上或飞行模式下，没有信号和漫游，HelloUZ 照样可用。",
  ko: "여행 전에 도시를 받아 두세요 — 산에서도, 기차에서도, 비행기 모드에서도 신호·로밍 없이 HelloUZ가 작동해요.",
  de: "Lade deine Städte vor der Reise — HelloUZ läuft in den Bergen, im Zug und im Flugmodus, ganz ohne Empfang und Roaming.",
  fr: "Téléchargez vos villes avant le départ — HelloUZ fonctionne en montagne, dans le train et en mode avion, sans réseau ni itinérance.",
  ja: "出発前に街をダウンロード — 山でも列車でも機内モードでも、電波やローミングなしでHelloUZが使えます。",
  tr: "Yolculuktan önce şehirleri indirin — HelloUZ dağda, trende ve uçak modunda sinyal ve dolaşım olmadan çalışır.",
  ar: "نزّل مدنك قبل الرحلة — ويعمل HelloUZ في الجبال وفي القطار وفي وضع الطيران دون إشارة أو تجوال.",
};

/** Ease-out: быстро стартует, мягко садится. */
const плавно = (x: number) => 1 - Math.pow(1 - x, 3);

/**
 * Первый экран — сцена «на липучке», как у сайтов-витрин из примеров:
 *
 * 1. Бухара во весь экран, огромное «HelloUZ» внизу, рядом — заголовок
 *    и кнопки. Камера медленно подлетает к минарету Калян.
 * 2. Текст растворяется по словам, фото уходит в размытие и ночь.
 * 3. Из темноты поднимается телефон с настоящим экраном приложения,
 *    а по бокам проплывают две панели с живыми цифрами.
 *
 * Размытие — не фильтр на каждом кадре (это тяжело), а заранее
 * размытая копия, которая проявляется поверх резкой.
 */
export default function Hero({ цифры }: { цифры: Цифры }) {
  const { t, язык } = useЯзык();
  const блок = useRef<HTMLElement>(null);
  const фото = useRef<HTMLDivElement>(null);
  const мягко = useRef<HTMLDivElement>(null);
  const ночь = useRef<HTMLDivElement>(null);
  const текст = useRef<HTMLDivElement>(null);
  const телефон = useRef<HTMLDivElement>(null);
  const сияние = useRef<HTMLDivElement>(null);
  const панельA = useRef<HTMLDivElement>(null);
  const панельB = useRef<HTMLDivElement>(null);
  const подсказка = useRef<HTMLDivElement>(null);

  const [ушёл, setУшёл] = useState(false);
  const [видноA, setВидноA] = useState(false);
  const [видноB, setВидноB] = useState(false);
  const флаги = useRef({ ушёл: false, a: false, b: false });

  // Текст проявляется, когда ушла заставка (или сразу, если её не было).
  const [готов, setГотов] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("intro-wait")) return setГотов(true);
    const mo = new MutationObserver(() => {
      if (!html.classList.contains("intro-wait")) {
        setГотов(true);
        mo.disconnect();
      }
    });
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  const показ = готов && !ушёл;

  useПрокрутка(блок, (п) => {
    const в = window.innerHeight;
    const зум = плавно(доля(п, 0, 0.6));
    if (фото.current) фото.current.style.transform = `scale(${1.06 + зум * 0.34})`;
    if (мягко.current) {
      мягко.current.style.opacity = String(доля(п, 0.16, 0.4));
      мягко.current.style.transform = `scale(${1.1 + зум * 0.34})`;
    }
    if (ночь.current) ночь.current.style.opacity = String(0.92 * доля(п, 0.2, 0.48));

    const т = доля(п, 0.12, 0.26);
    if (текст.current) {
      текст.current.style.opacity = String(1 - т);
      текст.current.style.transform = `translate3d(0, ${-110 * т}px, 0)`;
      текст.current.style.pointerEvents = т > 0.5 ? "none" : "auto";
    }
    if (подсказка.current) подсказка.current.style.opacity = String(1 - доля(п, 0, 0.06));

    const ф = плавно(доля(п, 0.34, 0.6));
    if (телефон.current) {
      телефон.current.style.opacity = String(доля(п, 0.33, 0.44));
      телефон.current.style.transform = `translate3d(0, ${(1 - ф) * 62}vh, 0) rotateX(${
        (1 - ф) * 26
      }deg) rotateY(${(доля(п, 0.6, 1) - 0.5) * -10}deg) scale(${0.84 + ф * 0.16})`;
    }
    if (сияние.current) сияние.current.style.opacity = String(ф);

    // Панели проезжают экран снизу вверх, каждая в своём окне прокрутки.
    const проезд = (el: HTMLDivElement | null, а: number, б: number) => {
      if (!el) return 0;
      const д = доля(п, а, б);
      const выс = el.offsetHeight;
      el.style.transform = `translate3d(0, ${в + 60 - д * (в + 60 + выс + 40)}px, 0)`;
      return д;
    };
    const дA = проезд(панельA.current, 0.44, 0.74);
    const дB = проезд(панельB.current, 0.62, 0.94);

    const ф2 = флаги.current;
    const новоеУшёл = п > 0.15;
    const новоеA = дA > 0.12 && дA < 0.9;
    const новоеB = дB > 0.12 && дB < 0.9;
    if (новоеУшёл !== ф2.ушёл) setУшёл((ф2.ушёл = новоеУшёл));
    if (новоеA !== ф2.a) setВидноA((ф2.a = новоеA));
    if (новоеB !== ф2.b) setВидноB((ф2.b = новоеB));
  });

  const экран = `/app/tabs/${язык === "ru" ? "ru" : "en"}-home.jpg`;
  const заголовок = `${t("hero_title_1")} ${t("hero_title_2")}`;

  return (
    <section id="top" ref={блок} data-nav="dark" className="relative h-[290vh] bg-black lg:h-[320vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ perspective: "1600px" }}>
        {/* Фото: резкое и размытая копия поверх */}
        <div
          ref={фото}
          className="absolute inset-0 will-change-transform"
          style={{ transformOrigin: "80% 40%" }}
        >
          <img
            src={БУХАРА}
            alt="Bukhara, Po-i-Kalyan"
            // На узком экране сдвигаем кадр к минарету — в портретной ориентации его иначе не видно.
            className="h-full w-full object-cover object-[90%_50%] lg:object-center"
            fetchPriority="high"
          />
        </div>
        <div
          ref={мягко}
          aria-hidden
          className="absolute inset-0 opacity-0 will-change-[opacity,transform]"
          style={{ transformOrigin: "80% 40%" }}
        >
          <img src={БУХАРА_МЯГКО} alt="" className="h-full w-full scale-110 object-cover object-[90%_50%] blur-2xl lg:object-center" />
        </div>
        {/* Затемнения для читаемости: сверху под шапку, снизу под текст */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,17,16,0.5) 0%, rgba(10,17,16,0) 22%, rgba(10,17,16,0) 38%, rgba(10,17,16,0.55) 62%, rgba(10,17,16,0.82) 100%)",
          }}
        />
        <div
          ref={ночь}
          aria-hidden
          className="absolute inset-0 opacity-0"
          style={{ background: "var(--night)" }}
        />

        {/* Бирюзовое сияние за телефоном */}
        <div
          ref={сияние}
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{
            background:
              "radial-gradient(circle, rgba(52,220,207,0.3) 0%, rgba(242,206,110,0.08) 40%, transparent 68%)",
          }}
        />

        {/* Телефон с настоящим экраном приложения */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1400px" }}>
          <div
            ref={телефон}
            className="relative opacity-0 will-change-transform"
            style={{ height: "min(70svh, 660px)", aspectRatio: "585 / 1266", transformStyle: "preserve-3d" }}
          >
            <div
              className="absolute -inset-[3.2%] rounded-[16%/7.5%] shadow-[0_60px_120px_-40px_rgba(15,179,172,0.55)]"
              style={{ background: "linear-gradient(145deg,#2c3a39,#0b1312 40%,#1d2a29)" }}
            />
            <div className="absolute inset-0 overflow-hidden rounded-[13%/6%] bg-black">
              <img src={экран} alt="HelloUZ" className="h-full w-full object-cover" />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.16), transparent 38%)" }}
              />
            </div>
            <div className="absolute left-1/2 top-[1.6%] h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>

        {/* Панели с цифрами: справа и слева, проезжают снизу вверх */}
        <div className="pointer-events-none absolute inset-0 z-20 mx-auto max-w-[1600px] px-5 sm:px-8">
          <div
            ref={панельA}
            className="absolute right-5 w-[min(92vw,380px)] sm:right-8 lg:right-[6%]"
            style={{ top: 0, transform: "translate3d(0, 120vh, 0)", willChange: "transform" }}
          >
            <Панель
              текст={тр(ПРО_КАРТУ, язык)}
              видно={видноA}
              строки={[
                [t("stat_cities"), <Счёт key="c" до={цифры.cities} />],
                [t("stat_places"), <Счёт key="p" до={цифры.places} />],
                [t("stat_venues"), <Счёт key="v" до={цифры.venues} />],
              ]}
            />
          </div>
          <div
            ref={панельB}
            className="absolute left-5 w-[min(92vw,380px)] sm:left-8 lg:left-[6%]"
            style={{ top: 0, transform: "translate3d(0, 120vh, 0)", willChange: "transform" }}
          >
            <Панель
              текст={тр(ПРО_ОФЛАЙН, язык)}
              видно={видноB}
              строки={[
                [t("stat_langs"), "10"],
                [t("trust_offline"), "✓"],
                [t("trust_free"), "✓"],
              ]}
            />
          </div>
        </div>

        {/* Текст первого экрана */}
        <div ref={текст} className="absolute inset-x-0 bottom-0 z-30 px-5 pb-7 text-white sm:px-8 sm:pb-10">
          <div className="mx-auto grid max-w-[1600px] items-end gap-7 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-7">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75 sm:text-xs">
                <Слова текст={t("hero_kicker")} видно={показ} уход={ушёл} шаг={0.04} />
              </p>
              <div
                aria-hidden
                dir="ltr"
                className="tight select-none whitespace-nowrap text-[clamp(4.4rem,16.5vw,15rem)] font-medium leading-[0.84] tracking-[-0.06em]"
              >
                <span className="hero-mark">
                  {"HelloUZ".split("").map((б, i) => (
                    <span key={i} style={{ ["--i" as string]: i }}>
                      {б}
                    </span>
                  ))}
                </span>
              </div>
              <p className="mt-5 max-w-[36rem] text-[15px] leading-[1.35] text-white/85 [text-indent:3.2em] sm:text-[17px] lg:[text-indent:7.5rem]">
                <Слова текст={t("hero_sub")} видно={показ} уход={ушёл} шаг={0.025} задержка={0.35} />
              </p>
            </div>
            <div className="flex flex-col gap-6 lg:col-span-4 lg:col-start-9 lg:pb-2">
              <h1 className="tight text-[clamp(1.7rem,2.5vw,2.5rem)] font-medium leading-[1.04] tracking-[-0.03em]">
                <Слова текст={заголовок} видно={показ} уход={ушёл} шаг={0.06} задержка={0.2} />{" "}
                <em className="serif font-semibold italic" style={{ color: "var(--gold-bright)" }}>
                  <Слова текст={t("hero_title_3")} видно={показ} уход={ушёл} задержка={0.45} />
                </em>
              </h1>
              {/* Магазины — «скоро», пока приложения там нет; рядом веб-версия. */}
              <div className="hero-cta">
                <StoreButtons тёмный />
              </div>
              <p className="flex gap-6 text-[13px] text-white/70">
                <span>(10 {t("stat_langs")})</span>
                <span>(2026)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Подсказка «листайте» */}
        <div
          ref={подсказка}
          aria-hidden
          className="absolute bottom-6 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 lg:flex"
        >
          <span className="h-10 w-px overflow-hidden bg-white/20">
            <span className="scroll-tick block h-4 w-px bg-white" />
          </span>
        </div>
      </div>
    </section>
  );
}

/** Панель как у витрин техники: цветная черта, утверждение, таблица характеристик. */
function Панель({
  текст,
  видно,
  строки,
}: {
  текст: string;
  видно: boolean;
  строки: [string, React.ReactNode][];
}) {
  return (
    <div className="rounded-2xl bg-[rgba(10,17,16,0.86)] p-5 text-white sm:rounded-none sm:bg-transparent sm:p-0">
      <div
        className="mb-6 ml-auto h-[2px] w-24"
        style={{ background: "linear-gradient(90deg, #34dccf 0%, #0fb3ac 40%, #f2ce6e 100%)" }}
      />
      <p className="tight text-[clamp(1.2rem,1.9vw,1.75rem)] font-normal leading-[1.18] tracking-[-0.03em] [text-indent:2.5em]">
        <Слова текст={текст} видно={видно} шаг={0.035} />
      </p>
      <div className="mt-10 border-t border-white/80 pt-3 sm:mt-14">
        {строки.map(([подпись, значение]) => (
          <div
            key={подпись}
            className="flex items-center gap-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.04em] sm:text-[13px]"
          >
            <span className="h-3.5 w-1.5 shrink-0 bg-white" />
            <span className="flex-1 truncate">{подпись}</span>
            <span className="tabular-nums">{значение}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
