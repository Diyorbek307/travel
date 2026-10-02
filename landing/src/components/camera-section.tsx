"use client";

import { useEffect, useState } from "react";
import { тр, useЯзык, type Многоязычно } from "@/lib/i18n";
import { Слова, Шахматка, ТИХО, useВКадре } from "./cinema";

/**
 * «ИИ-камера и VR» — вместо длинной сцены с плитками Регистана.
 *
 * Слева — что это: наводишь камеру, ИИ узнаёт памятник, картину или
 * надпись и рассказывает историю на твоём языке. В середине — живой
 * видоискатель: рамка ищет, сканирующая линия проходит по Регистану,
 * рамка «захватывает» цель, и снизу выезжает ответ — с настоящими датами
 * трёх медресе. Справа — VR-прогулки по городам с пометкой «скоро».
 */

const РЕГИСТАН =
  "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=900&q=75&auto=format&fit=crop";

const Т = {
  кикер: {
    en: "AI camera",
    ru: "ИИ-камера",
    uz: "AI-kamera",
    zh: "AI 相机",
    ko: "AI 카메라",
    de: "KI-Kamera",
    fr: "Caméra IA",
    ja: "AIカメラ",
    tr: "Yapay zekâ kamera",
    ar: "كاميرا الذكاء الاصطناعي",
  },
  заголовок: {
    en: "Point your camera — and the monument starts talking",
    ru: "Наведите камеру — и памятник заговорит",
    uz: "Kamerani qarating — yodgorlik gapira boshlaydi",
    zh: "举起相机——古迹开始讲述自己",
    ko: "카메라를 대면 유적이 말을 걸어요",
    de: "Kamera drauf — und das Denkmal erzählt",
    fr: "Visez avec l’appareil — et le monument se met à parler",
    ja: "カメラを向ければ、史跡が語り出す",
    tr: "Kamerayı tutun — anıt konuşmaya başlasın",
    ar: "وجّه الكاميرا — فيبدأ المعلم بالحديث",
  },
  текст: {
    en: "A facade, a painting in a museum, an inscription on a tile: the AI recognises what's in front of you and tells its story in your language — in text and out loud.",
    ru: "Фасад, картина в музее, надпись на изразце: ИИ узнаёт, что перед вами, и рассказывает историю на вашем языке — текстом и голосом.",
    uz: "Peshtoq, muzeydagi rasm, koshindagi yozuv: AI oldingizda nima turganini taniydi va tarixini oʻz tilingizda — matn va ovoz bilan aytib beradi.",
    zh: "建筑立面、博物馆里的画、瓷砖上的铭文：AI 会认出你眼前的事物，用你的语言讲述它的故事——文字和语音都有。",
    ko: "건물 정면, 박물관의 그림, 타일의 글귀까지 — AI가 눈앞의 대상을 알아보고 당신의 언어로 이야기를 들려줘요. 글로도, 목소리로도.",
    de: "Eine Fassade, ein Gemälde im Museum, eine Inschrift auf einer Kachel: Die KI erkennt, was vor dir steht, und erzählt die Geschichte in deiner Sprache — als Text und laut.",
    fr: "Une façade, un tableau au musée, une inscription sur un carreau : l’IA reconnaît ce que vous regardez et raconte son histoire dans votre langue — à l’écrit et à voix haute.",
    ja: "建物の正面、美術館の絵、タイルの銘文。AIが目の前のものを見分け、その物語をあなたの言語で文字と音声で伝えます。",
    tr: "Bir cephe, müzedeki bir tablo, bir çinideki yazı: yapay zekâ önünüzdekini tanır ve hikâyesini kendi dilinizde — yazıyla ve sesli — anlatır.",
    ar: "واجهة مبنى أو لوحة في متحف أو نقش على بلاطة: يتعرّف الذكاء الاصطناعي على ما أمامك ويروي قصته بلغتك — نصًا وصوتًا.",
  },
  ответ: {
    en: "Registan, Samarkand. Three madrasahs — Ulugh Beg (1420), Sher-Dor (1636) and Tilya-Kori (1660) — frame the main square of Tamerlane's city.",
    ru: "Регистан, Самарканд. Три медресе — Улугбека (1420), Шердор (1636) и Тилля-Кари (1660) — обрамляют главную площадь города Тамерлана.",
    uz: "Registon, Samarqand. Uchta madrasa — Ulugʻbek (1420), Sherdor (1636) va Tillakori (1660) — Amir Temur shahrining bosh maydonini oʻrab turadi.",
    zh: "撒马尔罕雷吉斯坦广场。兀鲁伯（1420）、希尔多尔（1636）和提拉卡里（1660）三座经学院环绕着帖木儿之城的中心广场。",
    ko: "사마르칸트 레기스탄. 울루그베그(1420), 셰르도르(1636), 틸랴코리(1660) 세 마드라사가 티무르 도시의 중앙 광장을 둘러싸고 있어요.",
    de: "Registan, Samarkand. Drei Medresen — Ulugh Beg (1420), Schir-Dor (1636) und Tilla-Kari (1660) — rahmen den Hauptplatz von Timurs Stadt.",
    fr: "Registan, Samarcande. Trois médersas — Ulugh Beg (1420), Cher-Dor (1636) et Tilla-Kari (1660) — encadrent la grande place de la ville de Tamerlan.",
    ja: "サマルカンドのレギスタン広場。ウルグ・ベク（1420年）、シェルドル（1636年）、ティラカリ（1660年）の3つのメドレセが、ティムールの都の中央広場を囲んでいます。",
    tr: "Registan, Semerkant. Uluğ Bey (1420), Şirdar (1636) ve Tilla Kari (1660) medreseleri Timur'un şehrinin ana meydanını çevreler.",
    ar: "ريجستان، سمرقند. ثلاث مدارس — أولوغ بيك (1420) وشير دار (1636) وطلا كاري (1660) — تحيط بالساحة الرئيسية لمدينة تيمور.",
  },
  ищу: {
    en: "Recognising…",
    ru: "Узнаю…",
    uz: "Aniqlanmoqda…",
    zh: "识别中…",
    ko: "인식 중…",
    de: "Erkenne…",
    fr: "Reconnaissance…",
    ja: "認識中…",
    tr: "Tanınıyor…",
    ar: "جارٍ التعرّف…",
  },
  скоро: {
    en: "Soon",
    ru: "Скоро",
    uz: "Tez orada",
    zh: "即将推出",
    ko: "곧 출시",
    de: "Bald",
    fr: "Bientôt",
    ja: "近日公開",
    tr: "Yakında",
    ar: "قريبًا",
  },
  vr: {
    en: "VR city walks",
    ru: "VR-прогулки по городам",
    uz: "Shaharlar boʻylab VR sayr",
    zh: "VR 城市漫步",
    ko: "VR 도시 산책",
    de: "VR-Stadtrundgänge",
    fr: "Balades VR dans les villes",
    ja: "VRで街歩き",
    tr: "VR şehir turları",
    ar: "جولات VR في المدن",
  },
  vrТекст: {
    en: "Put on a VR headset and walk through Samarkand, Bukhara and Khiva from home — before your trip or instead of it.",
    ru: "Наденьте VR-очки — и пройдитесь по Самарканду, Бухаре и Хиве, не выходя из дома: перед поездкой или вместо неё.",
    uz: "VR koʻzoynakni taqing va Samarqand, Buxoro va Xiva boʻylab uydan chiqmay sayr qiling — safardan oldin yoki uning oʻrniga.",
    zh: "戴上 VR 眼镜，足不出户漫步撒马尔罕、布哈拉和希瓦——出发前预览，或者代替一次旅行。",
    ko: "VR 헤드셋을 쓰고 집에서 사마르칸트, 부하라, 히바를 걸어 보세요 — 여행 전에, 또는 여행 대신.",
    de: "Setz eine VR-Brille auf und spaziere von zu Hause durch Samarkand, Buchara und Chiwa — vor der Reise oder statt ihr.",
    fr: "Mettez un casque VR et promenez-vous dans Samarcande, Boukhara et Khiva depuis chez vous — avant le voyage ou à sa place.",
    ja: "VRゴーグルをかけて、家にいながらサマルカンド、ブハラ、ヒヴァを歩く — 旅の前に、あるいは旅の代わりに。",
    tr: "VR gözlüğü takın ve Semerkant, Buhara ve Hiva'yı evden gezin — yolculuktan önce ya da onun yerine.",
    ar: "ارتدِ نظارة الواقع الافتراضي وتجوّل في سمرقند وبخارى وخيوة من منزلك — قبل رحلتك أو بدلًا منها.",
  },
} satisfies Record<string, Многоязычно>;

export default function CameraSection() {
  const { язык } = useЯзык();
  const [кадр, вКадре] = useВКадре<HTMLDivElement>(true, "0px 0px -25% 0px");
  // Ищет → нашёл. Под «уменьшить движение» сразу показываем ответ.
  const [нашёл, setНашёл] = useState(false);
  useEffect(() => {
    if (!вКадре) return;
    if (ТИХО()) return setНашёл(true);
    const id = setTimeout(() => setНашёл(true), 2200);
    return () => clearTimeout(id);
  }, [вКадре]);

  return (
    <section
      id="camera"
      data-nav="dark"
      className="relative isolate overflow-hidden text-white"
      style={{ background: "var(--night)" }}
    >
      <Шахматка цвет="#f4f7f7" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[90vh] w-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(52,220,207,0.12), transparent 65%)" }}
      />

      <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-12 px-5 pb-20 pt-[30vh] sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-[24vh]">
        {/* Что это */}
        <div className="lg:col-span-4">
          <p
            className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: "var(--gold-bright)" }}
          >
            ✦ {тр(Т.кикер, язык)}
          </p>
          <h2
            className="condensed text-[clamp(2.6rem,4.6vw,4.8rem)] font-bold leading-[0.95]"
            style={{ color: "var(--glow)" }}
          >
            <Слова текст={тр(Т.заголовок, язык)} шаг={0.09} />
          </h2>
          <p className="mt-7 max-w-[30rem] text-[16px] leading-relaxed text-white/80">
            <Слова текст={тр(Т.текст, язык)} шаг={0.02} задержка={0.3} />
          </p>
        </div>

        {/* Видоискатель */}
        <div ref={кадр} className="flex justify-center lg:col-span-5">
          <div
            className="relative w-[min(78vw,330px)] overflow-hidden rounded-[42px] border-[7px] shadow-[0_50px_100px_-40px_rgba(52,220,207,0.5)]"
            style={{ aspectRatio: "9 / 17", borderColor: "#1b2826", background: "#000" }}
          >
            <img
              src={РЕГИСТАН}
              alt="Registan, Samarkand"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.35), transparent 30%, transparent 55%, rgba(0,0,0,0.6))",
              }}
            />
            {/* Верхняя строка камеры */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 text-[11px] font-semibold">
              <span className="rounded-full bg-black/45 px-2.5 py-1">✦ HelloUZ AI</span>
              <span className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    нашёл ? "bg-[var(--glow)]" : "cam-blink bg-red-500"
                  }`}
                />
                {нашёл ? "AI" : "REC"}
              </span>
            </div>
            {/* Рамка прицела: ищет, потом «захватывает» цель */}
            <div
              aria-hidden
              className="absolute transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={нашёл ? { inset: "24% 10% 34% 10%" } : { inset: "16% 6% 26% 6%" }}
            >
              {[
                "left-0 top-0 border-l-2 border-t-2",
                "right-0 top-0 border-r-2 border-t-2",
                "bottom-0 left-0 border-b-2 border-l-2",
                "bottom-0 right-0 border-b-2 border-r-2",
              ].map((к) => (
                <span
                  key={к}
                  className={`absolute h-7 w-7 ${к} transition-colors duration-500`}
                  style={{ borderColor: нашёл ? "var(--glow)" : "rgba(255,255,255,0.85)" }}
                />
              ))}
              {вКадре && !нашёл && (
                <span
                  className="cam-scan absolute inset-x-0 top-0 h-[2px]"
                  style={{ background: "var(--glow)", boxShadow: "0 0 18px 4px rgba(52,220,207,0.6)" }}
                />
              )}
            </div>
            {/* Ответ ИИ */}
            <div
              className="absolute inset-x-3 bottom-3 rounded-[22px] p-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                background: "rgba(10,17,16,0.86)",
                border: "1px solid rgba(52,220,207,0.25)",
                transform: нашёл ? "none" : "translateY(12px)",
                opacity: вКадре ? 1 : 0,
              }}
            >
              {нашёл ? (
                <>
                  <p className="text-[13px] leading-snug text-white/90">
                    <Слова текст={тр(Т.ответ, язык)} видно={нашёл} шаг={0.02} />
                  </p>
                  {/* Голос: ИИ читает ответ вслух */}
                  <div aria-hidden className="mt-3 flex h-4 items-end gap-[3px]">
                    {Array.from({ length: 22 }, (_, i) => (
                      <span
                        key={i}
                        className="cam-wave w-[3px] rounded-full"
                        style={{ background: "var(--glow)", animationDelay: `${(i % 7) * -0.13}s` }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-white/70">{тр(Т.ищу, язык)}</p>
              )}
            </div>
          </div>
        </div>

        {/* VR — скоро */}
        <div className="lg:col-span-3">
          <div
            className="relative overflow-hidden rounded-[28px] border p-6"
            style={{ borderColor: "var(--night-line)", background: "var(--night-soft)" }}
          >
            <span
              className="absolute right-5 top-5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
              style={{ background: "var(--gold-bright)", color: "#1c1606" }}
            >
              {тр(Т.скоро, язык)}
            </span>
            <ОчкиVR />
            <h3
              className="condensed mt-4 text-[28px] font-bold leading-none"
              style={{ color: "var(--glow)" }}
            >
              {тр(Т.vr, язык)}
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-white/75">{тр(Т.vrТекст, язык)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** VR-очки: в линзах отражаются купол и минарет. */
function ОчкиVR() {
  return (
    <svg viewBox="0 0 220 120" className="mt-6 w-full max-w-[240px]" aria-hidden>
      <defs>
        <linearGradient id="vr-корпус" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2FD0C6" />
          <stop offset="0.6" stopColor="#0FB3AC" />
          <stop offset="1" stopColor="#07685F" />
        </linearGradient>
        <linearGradient id="vr-линза" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6D58A" />
          <stop offset="1" stopColor="#E9955A" />
        </linearGradient>
        <clipPath id="vr-л">
          <rect x="44" y="40" width="58" height="42" rx="16" />
          <rect x="118" y="40" width="58" height="42" rx="16" />
        </clipPath>
      </defs>
      {/* Ремешок */}
      <path
        d="M18 62 C18 30, 202 30, 202 62"
        fill="none"
        stroke="#22322f"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Корпус */}
      <rect x="30" y="28" width="160" height="68" rx="26" fill="url(#vr-корпус)" />
      <path d="M96 96 q14 -18 28 0" fill="#0a1110" />
      {/* Линзы с отражением города */}
      <rect x="44" y="40" width="58" height="42" rx="16" fill="url(#vr-линза)" />
      <rect x="118" y="40" width="58" height="42" rx="16" fill="url(#vr-линза)" />
      <g clipPath="url(#vr-л)" fill="#0B4F49">
        <rect x="44" y="70" width="58" height="12" />
        <path d="M58 70 a12 12 0 0 1 24 0 Z" />
        <rect x="88" y="54" width="5" height="18" />
        <rect x="118" y="70" width="58" height="12" />
        <path d="M132 70 a12 12 0 0 1 24 0 Z" />
        <rect x="162" y="54" width="5" height="18" />
      </g>
      <path d="M50 46 h18" stroke="#fff" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
      <path d="M124 46 h18" stroke="#fff" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
