"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useЯзык, type Ключ } from "@/lib/i18n";

/**
 * «Регистан: история в каждой плитке».
 *
 * Экран — стена изразцов, как в медресе: бирюзовая майолика с золотой
 * восьмиконечной звездой. Пока человек листает, плитки волной от центра
 * переворачиваются, и на обороте каждой — кусочек Регистана; стена
 * складывается в фотографию во весь экран, швы между плитками исчезают.
 * Потом поверх площади выходят три факта.
 *
 * Заменило «арку-портал»: она выглядела пустовато. Плитки двигаем прямо
 * через style.transform в requestAnimationFrame — без перерисовки React
 * на каждом кадре прокрутки; работают только transform, то есть
 * видеокарта.
 */

const ФАКТЫ: [Ключ, Ключ][] = [
  ["portal_f1_t", "portal_f1_s"],
  ["portal_f2_t", "portal_f2_s"],
  ["portal_f3_t", "portal_f3_s"],
];

const РЕГИСТАН =
  "https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=2400&q=80&auto=format&fit=crop";

/** Изразец: бирюзовая глазурь, золотая звезда-гирих, четверти кругов в
 *  углах — на стыке четырёх плиток они складываются в круг, как в кладке. */
const изразец = (фон: string, линия: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='${фон}'/><g fill='none' stroke='${линия}' stroke-width='2.4'><rect x='29' y='29' width='42' height='42'/><rect x='29' y='29' width='42' height='42' transform='rotate(45 50 50)'/><circle cx='50' cy='50' r='9'/><circle cx='0' cy='0' r='17'/><circle cx='100' cy='0' r='17'/><circle cx='0' cy='100' r='17'/><circle cx='100' cy='100' r='17'/></g><circle cx='50' cy='50' r='3.2' fill='#ffffff'/></svg>`,
  )}")`;
const ИЗРАЗЦЫ = [изразец("#0a6f69", "#e9c46a"), изразец("#0e8f88", "#f4dfa0")];

type Сетка = { cols: number; rows: number; w: number; h: number };

const плавно = (x: number) => 1 - Math.pow(1 - x, 3);

export default function MosaicSection() {
  const { t } = useЯзык();
  const обёртка = useRef<HTMLElement>(null);
  const плитки = useRef<(HTMLDivElement | null)[]>([]);
  const заголовок = useRef<HTMLDivElement>(null);
  const тень = useRef<HTMLDivElement>(null);
  const сцена = useRef<HTMLDivElement>(null);
  const [сетка, setСетка] = useState<Сетка>({ cols: 10, rows: 6, w: 1440, h: 900 });
  const [пропорция, setПропорция] = useState(1.5);
  const [фаза, setФаза] = useState(0);

  // Сетка под экран: плитки почти квадратные, на телефоне — крупнее.
  useEffect(() => {
    const мерить = () => {
      // Размер самой сцены (100svh), а не окна: на телефоне они расходятся
      // на высоту адресной строки, и нижний ряд плиток не совпал бы с фото.
      const w = сцена.current?.clientWidth || window.innerWidth;
      const h = сцена.current?.clientHeight || window.innerHeight;
      const cols = w >= 1024 ? 10 : w >= 640 ? 7 : 5;
      const rows = Math.max(4, Math.round((cols * h) / w));
      setСетка({ cols, rows, w, h });
    };
    мерить();
    window.addEventListener("resize", мерить);
    const img = new Image();
    img.onload = () => img.naturalHeight && setПропорция(img.naturalWidth / img.naturalHeight);
    img.src = РЕГИСТАН;
    return () => window.removeEventListener("resize", мерить);
  }, []);

  // Для каждой плитки: кусок фото (как object-fit: cover на весь экран)
  // и задержка волны — по расстоянию от центра.
  const раскладка = useMemo(() => {
    const { cols, rows, w, h } = сетка;
    const tw = w / cols;
    const th = h / rows;
    const coverW = Math.max(w, h * пропорция);
    const coverH = coverW / пропорция;
    const offX = (w - coverW) / 2;
    const offY = (h - coverH) / 2;
    const out: { c: number; r: number; фон: string; задержка: number; наклон: number }[] = [];
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const макс = Math.hypot(cx, cy) || 1;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        out.push({
          c,
          r,
          фон: `${offX - c * tw}px ${offY - r * th}px / ${coverW}px ${coverH}px`,
          задержка: Math.hypot(c - cx, r - cy) / макс,
          // Плитки переворачиваются не строем: у каждой свой небольшой крен.
          наклон: ((c * 37 + r * 61) % 11) - 5,
        });
      }
    return { out, tw, th };
  }, [сетка, пропорция]);

  useEffect(() => {
    const el = обёртка.current;
    if (!el) return;
    const тихо = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let кадр = 0;
    let прошлаяФаза = -1;
    const рисовать = () => {
      const r = el.getBoundingClientRect();
      const п = тихо ? 1 : Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      // 0…0.6 — плитки переворачиваются, дальше — факты.
      const a = Math.min(1, п / 0.6);
      раскладка.out.forEach((пл, i) => {
        const узел = плитки.current[i];
        if (!узел) return;
        const м = плавно(Math.min(1, Math.max(0, (a - пл.задержка * 0.55) / 0.45)));
        // Середина переворота — плитка чуть «отходит» от стены.
        const масштаб = 0.9 + 0.1 * м - Math.sin(Math.PI * м) * 0.08;
        узел.style.transform = `perspective(900px) rotateY(${(1 - м) * 180}deg) rotateZ(${
          (1 - м) * пл.наклон * 0.6
        }deg) scale(${масштаб})`;
      });
      if (заголовок.current) {
        заголовок.current.style.opacity = String(Math.max(0, 1 - a * 2.2));
        заголовок.current.style.transform = `translateY(${-a * 60}px)`;
      }
      const ф = Math.max(0, (п - 0.6) / 0.4);
      if (тень.current) тень.current.style.opacity = String(0.25 + ф * 0.75);
      const округлённая = Math.round(ф * 100) / 100;
      if (округлённая !== прошлаяФаза) {
        прошлаяФаза = округлённая;
        setФаза(округлённая);
      }
    };
    const при = () => {
      cancelAnimationFrame(кадр);
      кадр = requestAnimationFrame(рисовать);
    };
    рисовать();
    window.addEventListener("scroll", при, { passive: true });
    return () => {
      window.removeEventListener("scroll", при);
      cancelAnimationFrame(кадр);
    };
  }, [раскладка]);

  const шаг = Math.min(ФАКТЫ.length - 1, Math.floor(фаза * ФАКТЫ.length));

  return (
    <section ref={обёртка} id="portal" className="relative h-[330vh]">
      <div ref={сцена} className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: "#06302d" }}>
        {/* Стена изразцов */}
        {раскладка.out.map((пл, i) => (
          <div
            key={`${пл.c}-${пл.r}`}
            ref={(у) => {
              плитки.current[i] = у;
            }}
            className="absolute will-change-transform"
            style={{
              left: пл.c * раскладка.tw,
              top: пл.r * раскладка.th,
              // +1px — чтобы в собранной картинке не светились швы.
              width: раскладка.tw + 1,
              height: раскладка.th + 1,
              transformStyle: "preserve-3d",
              transform: "perspective(900px) rotateY(180deg) scale(0.9)",
            }}
          >
            {/* Лицо — кусочек Регистана */}
            <div
              className="absolute inset-0"
              style={{
                background: `url("${РЕГИСТАН}") ${пл.фон} no-repeat`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            />
            {/* Оборот — изразец с глазурью */}
            <div
              className="absolute inset-0 rounded-[3px]"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.22), transparent 45%), ${
                  ИЗРАЗЦЫ[(пл.c + пл.r) % 2]
                }`,
                backgroundSize: "100% 100%",
                boxShadow: "inset 0 0 0 1px rgba(233,196,106,0.35)",
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            />
          </div>
        ))}

        {/* Затемнение снизу — под факты */}
        <div
          ref={тень}
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.25,
            background: "linear-gradient(to top, rgba(4,20,18,0.85) 0%, rgba(4,20,18,0.25) 55%, transparent 100%)",
          }}
        />

        {/* Заголовок на стене изразцов — уходит, когда плитки поворачиваются */}
        <div
          ref={заголовок}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
        >
          <div
            className="rounded-[28px] px-8 py-7 sm:px-12"
            style={{
              background: "rgba(4,32,30,0.72)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              boxShadow: "0 0 0 1px rgba(233,196,106,0.4), 0 30px 60px -20px rgba(0,0,0,0.6)",
            }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>
              {t("portal_kicker")}
            </p>
            <h2 className="serif max-w-3xl text-[clamp(2rem,4.6vw,4.2rem)] font-semibold leading-[1.05] text-white">
              {t("portal_title")}
            </h2>
            <p className="hand mt-4 text-2xl text-white/80">{t("portal_hint")} ↓</p>
          </div>
        </div>

        {/* Факты поверх площади */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[12%] z-10 mx-auto max-w-3xl px-6 text-center text-white">
          {ФАКТЫ.map(([з, под], n) => (
            <div
              key={з}
              className="absolute inset-x-6 bottom-0 transition-all duration-700"
              style={{
                opacity: фаза > 0.02 && шаг === n ? 1 : 0,
                transform: `translateY(${шаг === n ? 0 : шаг > n ? -30 : 30}px)`,
              }}
            >
              <p className="hand mb-1 text-3xl" style={{ color: "var(--gold)" }}>
                0{n + 1}
              </p>
              <p className="serif text-[clamp(1.8rem,4vw,3.2rem)] font-semibold leading-tight drop-shadow-lg">
                {t(з)}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/85 drop-shadow">
                {t(под)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
