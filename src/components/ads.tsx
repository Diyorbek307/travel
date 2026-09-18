"use client";

import { useEffect, useMemo, useState } from "react";
import { ADS } from "@/data/content";
import { useAppContent } from "./content-provider";
import { useT } from "@/components/lang-provider";
import { BORDER, LIME, MUTED, SURFACE, TEXT, WHITE, контрастныйТекст, мягко } from "@/lib/theme";

/**
 * Партнёрские блоки.
 *
 * Это основной заработок приложения, поэтому блок не должен выглядеть
 * баннером, который взгляд привычно перепрыгивает. Он сделан как ещё
 * одна услуга приложения — «предложение рядом с вами»: тот же язык
 * карточек, что у мест и отелей, живая рамка акцентом-лаймом, польза
 * в первой строке.
 *
 * При этом пометка «Партнёр» видна всегда: по закону о рекламе скрывать
 * её нельзя, и прятать её ради красоты мы не будем. Сделано наоборот —
 * пометка часть оформления, а не извинение.
 */

export interface Креатив {
  id?: string;
  emoji: string;
  label: string;
  title: string;
  sub: string;
  cta: string;
  color: string;
  city?: string;
  url?: string;
}

/** Общий подбор креативов: живые из админки, иначе вшитые. */
function useКреативы(cities?: string[]) {
  const { ADS: live } = useAppContent();
  // Старые записи без url — демо-посев прошлой версии; их игнорируем.
  const all = useMemo(() => {
    const usable = (live as Креатив[]).filter((a) => a.url);
    return usable.length > 0 ? usable : (ADS as Креатив[]);
  }, [live]);
  // Таргет: город, где турист сейчас или куда строит маршрут. Товары
  // без города показываем везде.
  return useMemo(() => {
    const rel = all.filter((a) => !a.city || !cities || cities.length === 0 || cities.includes(a.city));
    return rel.length ? rel : all;
  }, [all, cities]);
}

function перейти(ad: Креатив) {
  if (ad.url) window.open(ad.url, "_blank", "noopener,noreferrer");
}

/** Пометка «Партнёр» — стеклянная плашка, читается на любом фоне. */
function Пометка({ тёмный = true }: { тёмный?: boolean }) {
  const { t } = useT();
  return (
    <span
      className="rounded-full px-2 py-[3px] text-[8px] font-bold uppercase"
      style={{
        letterSpacing: "0.14em",
        background: тёмный ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.08)",
        color: тёмный ? "rgba(255,255,255,0.92)" : MUTED,
        backdropFilter: "blur(8px)",
      }}
    >
      {t("ad_partner")}
    </span>
  );
}

/**
 * Главный формат: крупная карточка-предложение.
 *
 * Живая рамка лаймом — то, ради чего блок вообще замечают. Она не
 * мигает и не прыгает: медленный перелив по краю, который видно боковым
 * зрением, но который не мешает читать.
 */
export function AdSpotlight({ isPremium, cities }: { isPremium: boolean; cities?: string[] }) {
  const { t, трК } = useT();
  const ads = useКреативы(cities);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * 1000));
  const [скрыт, setСкрыт] = useState(false);

  // Смена предложения раз в 9 секунд — достаточно, чтобы прочитать.
  useEffect(() => {
    const таймер = setInterval(() => setIdx((i) => i + 1), 9000);
    return () => clearInterval(таймер);
  }, []);

  if (isPremium || скрыт || ads.length === 0) return null;
  const ad = ads[idx % ads.length];
  const текст = контрастныйТекст(ad.color);
  const вГороде = Boolean(ad.city && cities?.includes(ad.city));

  return (
    <div className="px-4 pt-5">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-base font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
          ✨ {t("ad_offer_title")}
        </p>
        <button onClick={() => setСкрыт(true)} className="text-[10px] transition-all active:scale-95" style={{ color: MUTED }}>
          {t("ad_hide")}
        </button>
      </div>

      {/* Рамка — отдельный слой под карточкой: так перелив идёт по краю,
          а содержимое остаётся неподвижным. */}
      <div
        className="rounded-3xl p-[2px]"
        style={{
          background: "linear-gradient(120deg,var(--accent-2),var(--accent),var(--accent-2))",
          backgroundSize: "200% 100%",
          animation: "ad-edge 6s linear infinite",
          // Мягкое свечение наружу: блок должен быть заметен боковым
          // зрением — на нём держится заработок приложения.
          boxShadow: "0 10px 30px var(--accent-2-soft), 0 2px 10px var(--accent-soft)",
        }}
      >
        <button
          onClick={() => перейти(ad)}
          className="relative w-full overflow-hidden rounded-[22px] text-left transition-all active:scale-[0.985]"
          style={{ background: `linear-gradient(135deg,${ad.color} 0%,${ad.color}cc 100%)` }}
        >
          {/* Мягкое свечение в углу — объём без картинки, которой у
              рекламодателя может и не быть. */}
          <span
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full"
            style={{ background: "rgba(255,255,255,0.22)", filter: "blur(36px)" }}
          />

          <div className="relative flex items-start gap-3 p-4">
            <span
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)" }}
            >
              {ad.emoji}
            </span>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <Пометка тёмный={текст === WHITE} />
                {ad.city && (
                  <span
                    className="text-[8px] font-bold uppercase"
                    style={{ letterSpacing: "0.1em", color: текст, opacity: 0.72 }}
                  >
                    📍 {трК(ad.city)} · {вГороде ? t("ad_in_city") : t("ad_on_route")}
                  </span>
                )}
              </div>
              <p className="font-bold leading-tight" style={{ color: текст, fontSize: 17, fontFamily: "'Fraunces',serif" }}>
                {трК(ad.title)}
              </p>
              <p className="mt-1 text-[11px] leading-snug" style={{ color: текст, opacity: 0.82 }}>
                {трК(ad.sub)}
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-between gap-3 px-4 pb-4">
            <span className="min-w-0 flex-1 truncate text-[9px]" style={{ color: текст, opacity: 0.6 }}>
              {t("ad_why")}
            </span>
            <span
              className="flex-shrink-0 rounded-xl px-3.5 py-2 text-[11px] font-bold"
              style={{
                background: текст === WHITE ? WHITE : "#14201d",
                color: текст === WHITE ? "#14201d" : WHITE,
              }}
            >
              {трК(ad.cta)} →
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

/**
 * Полка товаров — те креативы, что не привязаны к городу.
 *
 * Выглядит как обычная подборка приложения: горизонтальная лента
 * маленьких карточек. Именно поэтому её листают, а не пролистывают.
 */
export function AdShelf({ isPremium }: { isPremium: boolean }) {
  const { t, трК } = useT();
  const ads = useКреативы();
  const товары = ads.filter((a) => !a.city);
  if (isPremium || товары.length === 0) return null;
  return (
    <div className="pt-5">
      <div className="mb-3 flex items-center gap-2 px-4">
        <p className="text-base font-bold" style={{ color: TEXT, fontFamily: "'Fraunces',serif" }}>
          🎒 {t("ad_shelf_title")}
        </p>
        <Пометка тёмный={false} />
      </div>
      <div className="hide-scroll flex gap-2.5 overflow-x-auto px-4 pb-1">
        {товары.map((ad) => (
          <button
            key={ad.id ?? ad.title}
            onClick={() => перейти(ad)}
            className="flex w-[138px] flex-shrink-0 flex-col rounded-2xl border p-3 text-left transition-all active:scale-95"
            style={{ background: SURFACE, borderColor: BORDER }}
          >
            <span
              className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              style={{ background: мягко(ad.color, 12) }}
            >
              {ad.emoji}
            </span>
            <p className="truncate text-xs font-bold" style={{ color: TEXT }}>
              {трК(ad.title)}
            </p>
            <p
              className="mt-0.5 overflow-hidden text-[10px] leading-snug"
              style={{ color: MUTED, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
            >
              {трК(ad.sub)}
            </p>
            <span className="mt-2 text-[10px] font-bold" style={{ color: ad.color }}>
              {трК(ad.cta)} →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Узкая строка для экранов, где крупной карточке не место (список
 * ресторанов, практическая информация). Тот же смысл, меньше места.
 */
export function AdInline({ isPremium, cities }: { isPremium: boolean; cities?: string[] }) {
  const { трК } = useT();
  const ads = useКреативы(cities);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * 1000));
  const [скрыт, setСкрыт] = useState(false);
  useEffect(() => {
    const таймер = setInterval(() => setIdx((i) => i + 1), 9000);
    return () => clearInterval(таймер);
  }, []);
  if (isPremium || скрыт || ads.length === 0) return null;
  const ad = ads[idx % ads.length];
  return (
    <div className="mx-4 mb-3">
      <div
        className="flex items-center gap-3 rounded-2xl border px-3 py-2.5"
        style={{ background: SURFACE, borderColor: BORDER, borderLeft: `3px solid ${LIME}` }}
      >
        <button
          onClick={() => перейти(ad)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-all active:scale-90"
          style={{ background: мягко(ad.color, 12) }}
        >
          {ad.emoji}
        </button>
        <button onClick={() => перейти(ad)} className="min-w-0 flex-1 text-left">
          <div className="mb-0.5 flex items-center gap-1.5">
            <Пометка тёмный={false} />
          </div>
          <p className="text-xs font-bold leading-tight" style={{ color: TEXT }}>
            {трК(ad.title)}
          </p>
          <p className="mt-0.5 truncate text-[10px]" style={{ color: MUTED }}>
            {трК(ad.sub)}
          </p>
        </button>
        <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
          <button
            onClick={() => setСкрыт(true)}
            className="px-1 text-[10px] transition-all active:scale-90"
            style={{ color: MUTED }}
          >
            ✕
          </button>
          <button
            onClick={() => перейти(ad)}
            className="rounded-lg px-2.5 py-1 text-[9px] font-bold transition-all active:scale-95"
            style={{ background: ad.color, color: контрастныйТекст(ad.color) }}
          >
            {трК(ad.cta)}
          </button>
        </div>
      </div>
    </div>
  );
}
