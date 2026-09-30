"use client";

import { APP_URL, useЯзык, type Язык } from "@/lib/i18n";
import Reveal from "./reveal";

/**
 * Возможности — тёмный скруглённый блок, как страница блокнота на
 * сумеречном фоне: слева о главном, справа три высокие карточки в
 * закатных градиентах с силуэтом старого города у основания. Над ними —
 * облако «таблеток» со всем, что ещё есть в приложении.
 */

const ТЕГИ: Record<Язык, string>[] = [
  {
    en: "phrasebook with audio",
    ru: "разговорник с озвучкой",
    uz: "ovozli soʻzlashgich",
    zh: "有声常用语",
    ko: "음성 회화집",
    de: "Sprachführer mit Ton",
    fr: "guide de conversation audio",
    ja: "音声つき会話帳",
    tr: "sesli konuşma kılavuzu",
    ar: "عبارات بالصوت",
  },
  {
    en: "photo menu translator",
    ru: "переводчик меню по фото",
    uz: "menyuni surat orqali tarjima",
    zh: "拍照翻译菜单",
    ko: "사진 메뉴 번역",
    de: "Speisekarte per Foto übersetzen",
    fr: "traduction du menu en photo",
    ja: "写真でメニュー翻訳",
    tr: "fotoğrafla menü çevirisi",
    ar: "ترجمة القوائم بالصور",
  },
  {
    en: "“open now”",
    ru: "«открыто сейчас»",
    uz: "«hozir ochiq»",
    zh: "“营业中”",
    ko: "'지금 영업 중'",
    de: "„jetzt geöffnet“",
    fr: "« ouvert maintenant »",
    ja: "「営業中」",
    tr: "“şu an açık”",
    ar: "«مفتوح الآن»",
  },
  {
    en: "registration & e-mehmon",
    ru: "регистрация и e-mehmon",
    uz: "roʻyxatdan oʻtish va e-mehmon",
    zh: "住宿登记与 e-mehmon",
    ko: "체류 등록·e-mehmon",
    de: "Registrierung & e-mehmon",
    fr: "enregistrement et e-mehmon",
    ja: "滞在登録とe-mehmon",
    tr: "kayıt ve e-mehmon",
    ar: "التسجيل وe-mehmon",
  },
  {
    en: "train tickets: sale dates",
    ru: "билеты на поезд: когда продажа",
    uz: "poyezd chiptalari: sotuv sanasi",
    zh: "火车票开售日",
    ko: "기차표 판매일",
    de: "Zugtickets: Verkaufsstart",
    fr: "billets de train : ouverture",
    ja: "列車の切符：発売日",
    tr: "tren biletleri: satış tarihi",
    ar: "تذاكر القطار: موعد البيع",
  },
  {
    en: "taxi & Yandex Go",
    ru: "такси и Yandex Go",
    uz: "taksi va Yandex Go",
    zh: "出租车与 Yandex Go",
    ko: "택시·Yandex Go",
    de: "Taxi & Yandex Go",
    fr: "taxi et Yandex Go",
    ja: "タクシーとYandex Go",
    tr: "taksi ve Yandex Go",
    ar: "الأجرة وYandex Go",
  },
  {
    en: "eSIM",
    ru: "eSIM",
    uz: "eSIM",
    zh: "eSIM",
    ko: "eSIM",
    de: "eSIM",
    fr: "eSIM",
    ja: "eSIM",
    tr: "eSIM",
    ar: "eSIM",
  },
  {
    en: "offline mode",
    ru: "офлайн-режим",
    uz: "oflayn rejim",
    zh: "离线模式",
    ko: "오프라인 모드",
    de: "Offline-Modus",
    fr: "mode hors ligne",
    ja: "オフラインモード",
    tr: "çevrimdışı mod",
    ar: "وضع دون اتصال",
  },
  {
    en: "stamp passport",
    ru: "паспорт со штампами",
    uz: "muhrli pasport",
    zh: "印章护照",
    ko: "도장 여권",
    de: "Stempelpass",
    fr: "passeport à tampons",
    ja: "スタンプのパスポート",
    tr: "damgalı pasaport",
    ar: "جواز الأختام",
  },
  {
    en: "hotel & restaurant bookings",
    ru: "брони отелей и ресторанов",
    uz: "mehmonxona va restoran bronlari",
    zh: "酒店与餐厅预订",
    ko: "호텔·식당 예약",
    de: "Hotel- & Restaurantbuchung",
    fr: "réservations hôtels et restaurants",
    ja: "ホテル・レストラン予約",
    tr: "otel ve restoran rezervasyonu",
    ar: "حجز الفنادق والمطاعم",
  },
  {
    en: "SOS & support",
    ru: "SOS и поддержка",
    uz: "SOS va yordam",
    zh: "SOS 与客服",
    ko: "SOS·고객지원",
    de: "SOS & Support",
    fr: "SOS et assistance",
    ja: "SOSとサポート",
    tr: "SOS ve destek",
    ar: "SOS والدعم",
  },
  {
    en: "10 languages",
    ru: "10 языков",
    uz: "10 til",
    zh: "10 种语言",
    ko: "10개 언어",
    de: "10 Sprachen",
    fr: "10 langues",
    ja: "10言語",
    tr: "10 dil",
    ar: "10 لغات",
  },
];

/** Силуэт старого города: купола, минареты, порталы. */
function Силуэт({ вариант }: { вариант: number }) {
  const пути = [
    "M0 120 V78 H20 V60 Q32 34 44 60 V78 H60 V40 H66 V30 L69 22 L72 30 V40 H78 V78 H92 V66 Q110 30 128 66 V78 H150 V52 H156 V44 L159 36 L162 44 V52 H168 V78 H200 V120 Z",
    "M0 120 V84 H26 V56 H32 V46 L35 38 L38 46 V56 H44 V84 H58 V70 Q84 22 110 70 V84 H124 V62 Q138 44 152 62 V84 H170 V50 H176 V42 L179 34 L182 42 V50 H188 V84 H200 V120 Z",
    "M0 120 V80 H14 V64 Q28 44 42 64 V80 H56 V44 H62 V34 L65 26 L68 34 V44 H74 V80 H86 V58 H136 V80 H148 V60 Q164 36 180 60 V80 H200 V120 Z",
  ];
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 h-40 w-full"
      aria-hidden
    >
      <path d={пути[вариант % 3]} fill="rgba(6,52,48,0.9)" />
    </svg>
  );
}

const ГРАДИЕНТЫ = [
  "linear-gradient(180deg,#d4f5f1 0%,#72d8cf 55%,#0e9f98 100%)",
  "linear-gradient(180deg,#fdf1cf 0%,#f0d185 55%,#c99f3f 100%)",
  "linear-gradient(180deg,#dcefff 0%,#8ec5e6 55%,#2f7ea6 100%)",
];

export default function Features() {
  const { t, язык } = useЯзык();
  const карточки = [
    { заголовок: t("card1_t"), текст: t("card1_s"), знак: "✦" },
    { заголовок: t("card2_t"), текст: t("card2_s"), знак: "♫" },
    { заголовок: t("card3_t"), текст: t("card3_s"), знак: "⌖" },
  ];
  return (
    <section id="features" className="paper-grain px-3 py-20 sm:px-6 sm:py-28">
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-[36px] px-6 py-14 sm:px-12 sm:py-20"
        style={{ background: "linear-gradient(145deg, var(--accent-deep), var(--night) 65%)", color: "var(--paper)" }}
      >
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.6fr]">
          <Reveal>
            <p
              className="mb-5 text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: "var(--accent-light)" }}
            >
              {t("feat_kicker")}
            </p>
            <h2 className="serif mb-6 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.02]">
              {t("feat_title")}
            </h2>
            <p className="max-w-md text-[15px] leading-relaxed text-white/70">{t("feat_text")}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {ТЕГИ.map((тег, n) => (
                <span
                  key={тег.en}
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-transform hover:-translate-y-0.5"
                  style={
                    n % 3 === 0
                      ? { background: "rgba(233,196,106,0.95)", color: "var(--ink)" }
                      : n % 3 === 1
                      ? { border: "1px solid rgba(255,255,255,0.3)" }
                      : { background: "rgba(255,255,255,0.1)" }
                  }
                >
                  {тег[язык]}
                </span>
              ))}
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3">
            {карточки.map((к, n) => (
              <Reveal key={к.заголовок} delay={n * 0.1}>
                <article
                  className={`group relative flex h-[420px] flex-col overflow-hidden rounded-[26px] p-6 transition-transform duration-500 hover:-translate-y-3 ${
                    n === 1 ? "sm:mt-[-24px]" : ""
                  }`}
                  style={{ background: ГРАДИЕНТЫ[n], color: "var(--ink)" }}
                >
                  <span className="mb-3 text-2xl">{к.знак}</span>
                  <h3 className="serif mb-3 text-2xl font-semibold">{к.заголовок}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "rgba(13,23,21,0.78)" }}>
                    {к.текст}
                  </p>
                  <div className="transition-transform duration-700 group-hover:translate-y-2">
                    <Силуэт вариант={n} />
                  </div>
                  <a
                    href={APP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="relative z-10 mt-auto self-start rounded-full border border-white/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
                  >
                    {t("try_it")} →
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
