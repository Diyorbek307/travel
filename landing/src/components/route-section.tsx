"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { тр, useЯзык, type Многоязычно, type Язык } from "@/lib/i18n";
import { Слова, Шахматка, ТИХО, useВКадре } from "./cinema";

/**
 * «Шёлковый путь за 7 дней» — классический маршрут на тёмной «приборной»
 * карте, как трасса на сайте пилота F1: точечное поле, ползущие пунктиры
 * осей, пульс на Самарканде. Когда блок в кадре, маршрут один раз
 * «проезжается» светящейся линией за 6 секунд: города загораются, когда
 * голова линии проходит мимо, у перегонов появляются расстояния.
 * Потом курсор становится фонариком: точки под ним собираются в шахматку.
 *
 * Координаты городов — настоящие (широта/долгота), проекция
 * равнопромежуточная со сжатием по долготе на cos 41°.
 */

const ДОЛГОТА = [55.9, 73.2];
const ШИРОТА = [37.1, 45.6];
const ВЫС = 651;
const проекция = (lat: number, lon: number): [number, number] => [
  ((lon - ДОЛГОТА[0]) / (ДОЛГОТА[1] - ДОЛГОТА[0])) * 1000,
  ((ШИРОТА[1] - lat) / (ШИРОТА[1] - ШИРОТА[0])) * ВЫС,
];

type Город = { имя: Многоязычно; lat: number; lon: number; с: number; по: number };

const ГОРОДА: Город[] = [
  {
    имя: {
      en: "Tashkent",
      ru: "Ташкент",
      uz: "Toshkent",
      zh: "塔什干",
      ko: "타슈켄트",
      de: "Taschkent",
      fr: "Tachkent",
      ja: "タシケント",
      tr: "Taşkent",
      ar: "طشقند",
    },
    lat: 41.311,
    lon: 69.279,
    с: 1,
    по: 1,
  },
  {
    имя: {
      en: "Samarkand",
      ru: "Самарканд",
      uz: "Samarqand",
      zh: "撒马尔罕",
      ko: "사마르칸트",
      de: "Samarkand",
      fr: "Samarcande",
      ja: "サマルカンド",
      tr: "Semerkant",
      ar: "سمرقند",
    },
    lat: 39.654,
    lon: 66.976,
    с: 2,
    по: 3,
  },
  {
    имя: {
      en: "Bukhara",
      ru: "Бухара",
      uz: "Buxoro",
      zh: "布哈拉",
      ko: "부하라",
      de: "Buchara",
      fr: "Boukhara",
      ja: "ブハラ",
      tr: "Buhara",
      ar: "بخارى",
    },
    lat: 39.775,
    lon: 64.428,
    с: 4,
    по: 5,
  },
  {
    имя: {
      en: "Khiva",
      ru: "Хива",
      uz: "Xiva",
      zh: "希瓦",
      ko: "히바",
      de: "Chiwa",
      fr: "Khiva",
      ja: "ヒヴァ",
      tr: "Hiva",
      ar: "خيوة",
    },
    lat: 41.378,
    lon: 60.364,
    с: 6,
    по: 7,
  },
];

/** Промежуточные точки дороги: Джизак, Навои, Ургенч — чтобы линия шла, как трасса, а не по линейке. */
const ПУТЬ: [number, number][] = [
  [41.311, 69.279],
  [40.86, 68.7],
  [40.12, 67.84],
  [39.654, 66.976],
  [40.1, 65.38],
  [39.775, 64.428],
  [40.6, 62.9],
  [41.55, 60.63],
  [41.378, 60.364],
];

/** Прочие города — тусклые точки для ориентира. */
const ФОН: [number, number][] = [
  [42.46, 59.61], // Нукус
  [40.39, 71.78], // Фергана
  [40.78, 72.34], // Андижан
  [41.0, 71.67], // Наманган
  [37.22, 67.28], // Термез
  [38.86, 65.79], // Карши
  [40.12, 67.84], // Джизак
  [40.1, 65.38], // Навои
  [41.55, 60.63], // Ургенч
];

/** Расстояния по дорогам, округлённо. */
const ПЕРЕГОНЫ = [
  { км: 300, точка: 2 },
  { км: 270, точка: 4 },
  { км: 450, точка: 6 },
];

const КМ: Partial<Record<Язык, string>> = { ru: "км", zh: "公里", ar: "كم" };

const ДНИ = (я: Язык, a: number, b: number) => {
  const д = a === b ? `${a}` : `${a}–${b}`;
  const один = a === b;
  switch (я) {
    case "ru":
      return один ? `День ${д}` : `Дни ${д}`;
    case "uz":
      return `${д}-kun`;
    case "zh":
      return `第${д}天`;
    case "ko":
      return `${д}일차`;
    case "de":
      return один ? `Tag ${д}` : `Tage ${д}`;
    case "fr":
      return один ? `Jour ${д}` : `Jours ${д}`;
    case "ja":
      return `${д.replace("–", "〜")}日目`;
    case "tr":
      return `${д}. gün`;
    case "ar":
      return один ? `اليوم ${д}` : `الأيام ${д}`;
    default:
      return один ? `Day ${д}` : `Days ${д}`;
  }
};

const ТЕКСТ = {
  кикер: {
    en: "The classic route",
    ru: "Классический маршрут",
    uz: "Klassik yoʻnalish",
    zh: "经典路线",
    ko: "클래식 루트",
    de: "Die klassische Route",
    fr: "L’itinéraire classique",
    ja: "定番ルート",
    tr: "Klasik rota",
    ar: "المسار الكلاسيكي",
  },
  строка1: {
    en: "The Silk Road",
    ru: "Шёлковый путь",
    uz: "Buyuk Ipak yoʻli",
    zh: "丝绸之路",
    ko: "실크로드",
    de: "Die Seidenstraße",
    fr: "La route de la soie",
    ja: "シルクロード",
    tr: "İpek Yolu",
    ar: "طريق الحرير",
  },
  строка2: {
    en: "in 7 days",
    ru: "за 7 дней",
    uz: "7 kunda",
    zh: "7天走完",
    ko: "7일 만에",
    de: "in 7 Tagen",
    fr: "en 7 jours",
    ja: "7日間で",
    tr: "7 günde",
    ar: "في 7 أيام",
  },
  вступление: {
    en: "Tashkent, Samarkand, Bukhara and Khiva — the four cities most journeys through Uzbekistan begin with. HelloUZ lays the trip out day by day: what to see, where to eat and how to get there.",
    ru: "Ташкент, Самарканд, Бухара и Хива — четыре города, с которых начинается знакомство с Узбекистаном. HelloUZ раскладывает поездку по дням: что смотреть, где поесть и как добраться.",
    uz: "Toshkent, Samarqand, Buxoro va Xiva — Oʻzbekiston bilan tanishuv odatda shu toʻrt shahardan boshlanadi. HelloUZ safarni kunlarga ajratadi: nimani koʻrish, qayerda ovqatlanish va qanday borish.",
    zh: "塔什干、撒马尔罕、布哈拉和希瓦——大多数乌兹别克斯坦之旅都从这四座城市开始。HelloUZ 按天安排行程：看什么、在哪儿吃、怎么去。",
    ko: "타슈켄트, 사마르칸트, 부하라, 히바 — 우즈베키스탄 여행은 대개 이 네 도시에서 시작돼요. HelloUZ는 여행을 하루 단위로 정리해 줘요: 무엇을 보고, 어디서 먹고, 어떻게 가는지.",
    de: "Taschkent, Samarkand, Buchara und Chiwa — mit diesen vier Städten beginnen die meisten Reisen durch Usbekistan. HelloUZ teilt die Reise in Tage: was du siehst, wo du isst und wie du hinkommst.",
    fr: "Tachkent, Samarcande, Boukhara et Khiva — la plupart des voyages en Ouzbékistan commencent par ces quatre villes. HelloUZ organise le séjour jour par jour : que voir, où manger et comment s’y rendre.",
    ja: "タシケント、サマルカンド、ブハラ、ヒヴァ——ウズベキスタンの旅の多くはこの4都市から始まります。HelloUZ は旅を1日ずつ整理します。見どころ、食事、移動手段まで。",
    tr: "Taşkent, Semerkant, Buhara ve Hiva — Özbekistan yolculuklarının çoğu bu dört şehirle başlar. HelloUZ geziyi gün gün planlar: ne görülür, nerede yenir, nasıl gidilir.",
    ar: "طشقند وسمرقند وبخارى وخيوة — تبدأ معظم الرحلات في أوزبكستان بهذه المدن الأربع. يقسّم HelloUZ الرحلة يومًا بيوم: ماذا ترى، وأين تأكل، وكيف تصل.",
  },
  города: {
    en: "cities",
    ru: "города",
    uz: "shahar",
    zh: "座城市",
    ko: "개 도시",
    de: "Städte",
    fr: "villes",
    ja: "都市",
    tr: "şehir",
    ar: "مدن",
  },
  путь: {
    en: "km on the road",
    ru: "км в пути",
    uz: "km yoʻl",
    zh: "公里路程",
    ko: "km 이동",
    de: "km unterwegs",
    fr: "km de route",
    ja: "kmの道のり",
    tr: "km yol",
    ar: "كم على الطريق",
  },
  дней: {
    en: "days",
    ru: "дней",
    uz: "kun",
    zh: "天",
    ko: "일",
    de: "Tage",
    fr: "jours",
    ja: "日間",
    tr: "gün",
    ar: "أيام",
  },
} satisfies Record<string, Многоязычно>;

/** Сглаживание ломаной в кривую Катмулла — Рома, как SVG-путь. */
function кривая(точки: [number, number][]) {
  let d = `M${точки[0][0].toFixed(1)},${точки[0][1].toFixed(1)}`;
  for (let i = 0; i < точки.length - 1; i++) {
    const p0 = точки[i - 1] ?? точки[i];
    const p1 = точки[i];
    const p2 = точки[i + 1];
    const p3 = точки[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(
      1,
    )},${p2[1].toFixed(1)}`;
  }
  return d;
}

const ОКНО = { x: 170, y: 190, w: 700, h: 380 };
/** На телефоне — плотнее, только сам маршрут, чтобы подписи не были мелкими. */
const ОКНО_УЗКО = { x: 205, y: 228, w: 615, h: 300 };

export default function RouteSection() {
  const { t, язык } = useЯзык();
  const [кадр, вКадре] = useВКадре<HTMLDivElement>(true, "0px 0px -30% 0px");
  const линия = useRef<SVGPathElement>(null);
  const свечение = useRef<SVGPathElement>(null);
  const голова = useRef<SVGGElement>(null);
  const [пройдено, setПройдено] = useState(-1);
  const [готово, setГотово] = useState(false);
  const [узко, setУзко] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const при = () => setУзко(mq.matches);
    при();
    mq.addEventListener("change", при);
    return () => mq.removeEventListener("change", при);
  }, []);
  const окно = узко ? ОКНО_УЗКО : ОКНО;

  const точки = useMemo(() => ПУТЬ.map(([a, b]) => проекция(a, b)), []);
  const d = useMemo(() => кривая(точки), [точки]);
  const города = useMemo(() => ГОРОДА.map((г) => ({ ...г, xy: проекция(г.lat, г.lon) })), []);

  // Проезд маршрута: один раз, 6 секунд, ease-in-out.
  useEffect(() => {
    if (!вКадре) return;
    const путь = линия.current;
    const свет = свечение.current;
    if (!путь || !свет) return;
    const L = путь.getTotalLength();
    // Где на пути каждый город и каждый перегон — ищем ближайшую точку.
    const образцы = Array.from({ length: 600 }, (_, i) => {
      const p = путь.getPointAtLength((i / 599) * L);
      return { s: i / 599, x: p.x, y: p.y };
    });
    const где = (x: number, y: number) =>
      образцы.reduce((лучший, о) =>
        Math.hypot(о.x - x, о.y - y) < Math.hypot(лучший.x - x, лучший.y - y) ? о : лучший,
      ).s;
    const вехи = города.map((г) => где(г.xy[0], г.xy[1]));

    const поставить = (s: number) => {
      const off = String(L * (1 - s));
      путь.style.strokeDashoffset = off;
      свет.style.strokeDashoffset = off;
      const p = путь.getPointAtLength(L * s);
      голова.current?.setAttribute("transform", `translate(${p.x},${p.y})`);
      let n = -1;
      вехи.forEach((в, i) => s >= в - 0.004 && (n = i));
      setПройдено(n);
    };
    [путь, свет].forEach((э) => (э.style.strokeDasharray = `${L} ${L}`));
    if (ТИХО()) {
      поставить(1);
      setГотово(true);
      return;
    }
    const старт = performance.now();
    const ДЛИНА = 6000;
    let id = 0;
    const шаг = (сейчас: number) => {
      const x = Math.min(1, (сейчас - старт) / ДЛИНА);
      поставить(-(Math.cos(Math.PI * x) - 1) / 2);
      if (x < 1) id = requestAnimationFrame(шаг);
      else setГотово(true);
    };
    id = requestAnimationFrame(шаг);
    return () => cancelAnimationFrame(id);
  }, [вКадре, города]);

  const км = КМ[язык] ?? "km";

  return (
    <section
      id="route"
      data-nav="dark"
      className="relative isolate overflow-hidden text-white"
      style={{ background: "var(--night)" }}
    >
      <Шахматка цвет="#f4f7f7" искра="#34dccf" />
      <ТочкиПоле />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1600px] gap-10 px-5 pb-12 pt-[26vh] sm:px-8 lg:grid-cols-12 lg:pb-16 lg:pt-[22vh]">
        {/* Слева: заголовок и вступление */}
        <div className="lg:col-span-4">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
            {тр(ТЕКСТ.кикер, язык)}
          </p>
          <h2
            className="condensed text-[clamp(3rem,6.2vw,6.4rem)] font-bold leading-[0.92]"
            style={{ color: "var(--glow)" }}
          >
            <span className="block">
              <Слова текст={тр(ТЕКСТ.строка1, язык)} шаг={0.11} />
            </span>
            <span className="block">
              <Слова текст={тр(ТЕКСТ.строка2, язык)} шаг={0.11} задержка={0.13} />
              <span className="text-white">.</span>
            </span>
          </h2>
          <span className="mt-7 block h-[2px] w-12" style={{ background: "var(--glow)" }} />
          <p className="mt-7 max-w-[26rem] text-[15px] uppercase leading-[1.35] tracking-[0.01em] text-white/80 sm:text-[16px]">
            <Слова текст={тр(ТЕКСТ.вступление, язык)} шаг={0.025} задержка={0.3} />
          </p>
          <a
            href="#quiz"
            className="group relative mt-9 inline-flex h-[52px] items-center gap-6 pl-6 pr-7 text-[14px] font-semibold uppercase tracking-[0.04em]"
            style={{ color: "var(--glow)" }}
          >
            <svg
              viewBox="0 0 230 52"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <path
                d="M0.5 0.5H229.5V43L221 51.5H0.5Z"
                fill="var(--night-soft)"
                stroke="var(--glow)"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M0.5 0.5H229.5V43L221 51.5H0.5Z"
                fill="var(--glow)"
                className="origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
              />
            </svg>
            <span className="relative transition-colors duration-300 group-hover:text-[var(--night)]">
              {t("quiz_go")}
            </span>
            <span className="relative transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--night)] rtl:rotate-180">
              →
            </span>
          </a>
        </div>

        {/* Справа: карта маршрута */}
        <div ref={кадр} className="relative lg:col-span-8">
          <svg
            viewBox={`${окно.x} ${окно.y} ${окно.w} ${окно.h}`}
            className="h-auto w-full overflow-visible"
            role="img"
            aria-label={ГОРОДА.map((г) => тр(г.имя, язык)).join(" → ")}
          >
            <defs>
              <filter id="маршрут-свет" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            {/* Оси через Самарканд, пунктир ползёт */}
            <g stroke="rgba(255,255,255,0.14)" strokeWidth="1" vectorEffect="non-scaling-stroke">
              <line x1={города[1].xy[0]} y1="-2000" x2={города[1].xy[0]} y2="2000" className="axis-crawl" />
              <line x1="-2000" y1={города[1].xy[1]} x2="3000" y2={города[1].xy[1]} className="axis-crawl" />
              <line
                x1={города[0].xy[0]}
                y1="-2000"
                x2={города[0].xy[0]}
                y2="2000"
                className="axis-crawl"
                opacity="0.6"
              />
              <line
                x1={города[3].xy[0]}
                y1="-2000"
                x2={города[3].xy[0]}
                y2="2000"
                className="axis-crawl"
                opacity="0.6"
              />
            </g>
            <g fill="none" stroke="rgba(255,255,255,0.1)">
              <circle cx={города[1].xy[0]} cy={города[1].xy[1]} r="22" />
              <circle cx={города[1].xy[0]} cy={города[1].xy[1]} r="120" strokeDasharray="2 5" />
              <circle cx={города[1].xy[0]} cy={города[1].xy[1]} r="230" strokeDasharray="2 7" opacity="0.6" />
              <circle cx={города[1].xy[0]} cy={города[1].xy[1]} r="4" className="map-ping" stroke="var(--glow)" />
            </g>

            {/* Прочие города */}
            {ФОН.map(([a, b], i) => {
              const [x, y] = проекция(a, b);
              return <circle key={i} cx={x} cy={y} r="2.4" fill="rgba(255,255,255,0.28)" />;
            })}

            {/* Дорога: сначала тусклая целиком, поверх — светящаяся, которая «проезжает» */}
            <path d={d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" strokeDasharray="4 6" />
            <path
              ref={свечение}
              d={d}
              fill="none"
              stroke="var(--glow)"
              strokeWidth="9"
              strokeLinecap="round"
              opacity={готово ? 0.25 : 0.6}
              filter="url(#маршрут-свет)"
              style={{ strokeDasharray: 4000, strokeDashoffset: 4000, transition: "opacity 0.8s" }}
            />
            <path
              ref={линия}
              d={d}
              fill="none"
              stroke="var(--glow)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ strokeDasharray: 4000, strokeDashoffset: 4000 }}
            />
            <g ref={голова} style={{ opacity: готово || пройдено < 0 ? 0 : 1, transition: "opacity 0.8s" }}>
              <circle r="11" fill="var(--glow)" opacity="0.35" filter="url(#маршрут-свет)" />
              <circle r="4.5" fill="#fff" />
            </g>

            {/* Расстояния на перегонах */}
            {ПЕРЕГОНЫ.map((п, i) => {
              const [x, y] = точки[п.точка];
              return (
                <text
                  key={i}
                  x={x}
                  y={y - 16}
                  textAnchor="middle"
                  className="tight"
                  fontSize="13"
                  fill="rgba(255,255,255,0.65)"
                  style={{ opacity: пройдено > i ? 1 : 0, transition: "opacity 0.6s" }}
                >
                  ≈ {п.км} {км}
                </text>
              );
            })}

            {/* Города маршрута */}
            {города.map((г, i) => {
              const горит = пройдено >= i;
              const [x, y] = г.xy;
              const сверху = i === 0 || i === 3;
              return (
                <g key={г.имя.en} transform={`translate(${x},${y})`}>
                  {горит && <circle r="6" fill="none" stroke="var(--glow)" className="map-flash" />}
                  <rect
                    x="-6"
                    y="-6"
                    width="12"
                    height="12"
                    transform="rotate(45)"
                    fill={горит ? "var(--glow)" : "var(--night)"}
                    stroke={горит ? "var(--glow)" : "rgba(255,255,255,0.5)"}
                    style={{ transition: "fill 0.4s, stroke 0.4s" }}
                  />
                  <g
                    style={{
                      opacity: горит ? 1 : 0.35,
                      transform: горит ? "none" : "translateY(6px)",
                      transition: "opacity 0.6s, transform 0.6s",
                    }}
                  >
                    <text
                      y={сверху ? -42 : 32}
                      textAnchor="middle"
                      className="condensed"
                      fontSize="22"
                      fontWeight="700"
                      fill="#fff"
                    >
                      {тр(г.имя, язык)}
                    </text>
                    <text
                      y={сверху ? -22 : 52}
                      textAnchor="middle"
                      fontSize="12"
                      letterSpacing="1.5"
                      fill="var(--gold-bright)"
                      style={{ textTransform: "uppercase" }}
                    >
                      {ДНИ(язык, г.с, г.по)}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Плашка с итогами, со срезанным углом */}
          <div
            className="relative mt-8 ml-auto grid w-full max-w-[420px] grid-cols-3 text-white lg:mt-2"
            style={{
              opacity: готово ? 1 : 0,
              transform: готово ? "none" : "translateY(12px)",
              transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <svg
              viewBox="0 0 420 92"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <path
                d="M0.5 0.5H419.5V81L409 91.5H0.5Z"
                fill="var(--night-soft)"
                stroke="var(--glow)"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="140"
                y1="0"
                x2="140"
                y2="92"
                stroke="rgba(52,220,207,0.35)"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="280"
                y1="0"
                x2="280"
                y2="92"
                stroke="rgba(52,220,207,0.35)"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {[
              ["4", тр(ТЕКСТ.города, язык)],
              ["≈1000", тр(ТЕКСТ.путь, язык)],
              ["7", тр(ТЕКСТ.дней, язык)],
            ].map(([ч, п]) => (
              <div key={п} className="relative px-4 py-4">
                <p dir="ltr" className="condensed text-[34px] font-bold leading-none rtl:text-right" style={{ color: "var(--glow)" }}>
                  {ч}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-white/75">{п}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Точечное поле на весь блок. Покоящиеся точки рисуются один раз;
 * под курсором (только мышь) точки вырастают в квадраты и собираются
 * в шахматку — фонарик по «приборной» карте.
 */
function ТочкиПоле() {
  const холст = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = холст.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const ШАГ = 16;
    let ш = 0;
    let в = 0;
    let dpr = 1;
    let фон: HTMLCanvasElement | null = null;
    const мышь = { x: -9999, y: -9999, есть: false };
    const свет = { x: -9999, y: -9999, сила: 0 };
    let кадр = 0;

    const маска = (x: number, y: number) => {
      // Ярче к правому центру (где карта), гаснет к краям.
      const dx = (x / ш - 0.62) / 0.55;
      const dy = (y / в - 0.55) / 0.6;
      return Math.max(0, 1 - Math.hypot(dx, dy));
    };
    const испечь = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      ш = c.clientWidth;
      в = c.clientHeight;
      c.width = Math.round(ш * dpr);
      c.height = Math.round(в * dpr);
      фон = document.createElement("canvas");
      фон.width = c.width;
      фон.height = c.height;
      const f = фон.getContext("2d");
      if (!f) return;
      f.scale(dpr, dpr);
      for (let y = ШАГ / 2; y < в; y += ШАГ)
        for (let x = ШАГ / 2; x < ш; x += ШАГ) {
          const м = маска(x, y);
          if (м <= 0.02) continue;
          f.fillStyle = `rgba(255,255,255,${0.04 + м * 0.16})`;
          f.beginPath();
          f.arc(x, y, 1.15, 0, Math.PI * 2);
          f.fill();
        }
      рисовать();
    };
    const рисовать = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      if (фон) ctx.drawImage(фон, 0, 0);
      if (свет.сила < 0.01) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const R = 150;
      const i0 = Math.floor((свет.x - R) / ШАГ);
      const j0 = Math.floor((свет.y - R) / ШАГ);
      for (let j = j0; j <= j0 + (2 * R) / ШАГ + 1; j++)
        for (let i = i0; i <= i0 + (2 * R) / ШАГ + 1; i++) {
          const x = i * ШАГ + ШАГ / 2;
          const y = j * ШАГ + ШАГ / 2;
          const к = (1 - Math.hypot(x - свет.x, y - свет.y) / R) * свет.сила;
          if (к <= 0.15) continue;
          // Шахматка: на «белых» клетках — квадрат, на «чёрных» — пусто.
          if ((i + j) % 2) continue;
          const s = ШАГ * (0.25 + 0.7 * Math.min(1, (к - 0.15) / 0.5));
          ctx.fillStyle = `rgba(52,220,207,${0.12 + к * 0.45})`;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
    };
    const цикл = () => {
      свет.x += (мышь.x - свет.x) * 0.2;
      свет.y += (мышь.y - свет.y) * 0.2;
      свет.сила += ((мышь.есть ? 1 : 0) - свет.сила) * 0.1;
      рисовать();
      const покой =
        Math.abs(мышь.x - свет.x) + Math.abs(мышь.y - свет.y) < 0.5 &&
        Math.abs((мышь.есть ? 1 : 0) - свет.сила) < 0.01;
      кадр = покой ? 0 : requestAnimationFrame(цикл);
    };
    let виден = false;
    const при = (e: PointerEvent) => {
      // Карта вне экрана — мышь нас не касается, ничего не считаем.
      if (e.pointerType !== "mouse" || !виден) return;
      const r = c.getBoundingClientRect();
      мышь.x = e.clientX - r.left;
      мышь.y = e.clientY - r.top;
      мышь.есть = мышь.y >= 0 && мышь.y <= r.height;
      if (свет.сила < 0.01 && мышь.есть) {
        свет.x = мышь.x;
        свет.y = мышь.y;
      }
      if (!кадр && (мышь.есть || свет.сила > 0.01)) кадр = requestAnimationFrame(цикл);
    };
    испечь();
    const io = new IntersectionObserver(([e]) => {
      виден = e.isIntersecting;
      if (!виден && свет.сила > 0.01) {
        мышь.есть = false;
        if (!кадр) кадр = requestAnimationFrame(цикл);
      }
    });
    io.observe(c);
    const ro = new ResizeObserver(испечь);
    ro.observe(c);
    const можно = window.matchMedia("(hover: hover)").matches && !ТИХО();
    if (можно) window.addEventListener("pointermove", при, { passive: true });
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", при);
      cancelAnimationFrame(кадр);
    };
  }, []);
  return <canvas ref={холст} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
